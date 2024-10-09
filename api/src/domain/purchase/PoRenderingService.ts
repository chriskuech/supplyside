import { FieldType } from '@prisma/client'
import { OsService } from '@supplyside/api/os'
import {
  FieldReference,
  Resource,
  ResourceField,
  fields,
  formatInlineAddress,
  selectResourceField,
  selectResourceFieldValue,
} from '@supplyside/model'
import fs from 'fs'
import { readFile, writeFile } from 'fs/promises'
import Handlebars from 'handlebars'
import { inject, injectable } from 'inversify'
import { dirname } from 'path'
import { isTruthy } from 'remeda'
import { P, match } from 'ts-pattern'
import { fileURLToPath } from 'url'
import { AccountService } from '../account/AccountService'
import { BlobService } from '../blob/BlobService'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'
import {
  AddressViewModel,
  LineViewModel,
  PurchaseViewModel,
} from './PurchaseViewModel'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

@injectable()
export class PoRenderingService {
  constructor(
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(OsService) private readonly osService: OsService,
  ) {
    Handlebars.registerHelper('add', function (a, b) {
      return a + b
    })
  }

  async renderPo(
    accountId: string,
    resourceId: string,
    { isPreview }: { isPreview?: boolean } = {},
  ) {
    return await this.osService.withTempDir(async (tempDir) => {
      try {
        const viewModel = await this.createViewModel(
          accountId,
          resourceId,
          isPreview,
        )

        // Read the Handlebars template
        const templatePath = `${__dirname}/data/PoDocument.hbs`
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template file not found at ${templatePath}`)
        }
        const templateSource = await readFile(templatePath, 'utf-8')

        // Compile the template
        const template = Handlebars.compile(templateSource)

        // Render the HTML
        const html = template(viewModel)

        // Save the HTML to a file
        const htmlPath = `${tempDir}/out.html`
        await writeFile(htmlPath, html)

        // Convert the HTML file to a PDF file
        const pdfPath = `${tempDir}/out.pdf`
        await this.osService.exec(
          `weasyprint '${htmlPath}' '${pdfPath}' --pdf-variant=pdf/ua-1`,
        )
        if (!fs.existsSync(pdfPath)) {
          throw new Error(`PDF file not generated at ${pdfPath}`)
        }

        return await readFile(pdfPath)
      } catch (error) {
        console.error('Error in renderPo:', error)
        throw error
      }
    })
  }

  async createViewModel(
    accountId: string,
    purchaseId: string,
    isPreview?: boolean,
  ): Promise<PurchaseViewModel> {
    const [order, lines, lineSchema, account] = await Promise.all([
      this.resourceService.read(accountId, purchaseId),
      this.resourceService.list(accountId, 'PurchaseLine', {
        where: {
          '==': [{ var: 'Purchase' }, purchaseId],
        },
      }),
      this.schemaService.readMergedSchema(accountId, 'PurchaseLine'),
      this.accountService.read(accountId),
    ])

    const vendorId = selectResourceFieldValue(order, fields.vendor)?.resource
      ?.id

    const vendor = vendorId
      ? await this.resourceService.read(account.id, vendorId)
      : undefined

    const blob = account.logoBlobId
      ? await this.blobService.readBlobWithData(account.id, account.logoBlobId)
      : undefined

    const lineAdditionalFields = lineSchema.fields.filter(
      (field) =>
        ![
          fields.itemName.templateId,
          fields.totalCost.templateId,
          fields.unitOfMeasure.templateId,
          fields.unitCost.templateId,
          fields.quantity.templateId,
        ].includes(field.templateId as string),
    )

    return {
      logoBlobDataUrl: account?.logoBlobId
        ? `data:${blob?.mimeType};base64,${blob?.buffer.toString('base64')}`
        : null,
      lines: await Promise.all(
        lines.map(async (line) => {
          return {
            itemName: renderTemplateField(line, fields.itemName),
            quantity: renderTemplateField(line, fields.quantity),
            unitOfMeasure: renderTemplateField(line, fields.unitOfMeasure),
            unitCost: renderTemplateField(line, fields.unitCost),
            totalCost: renderTemplateField(line, fields.totalCost),
            additionalFields: lineAdditionalFields
              .map(({ name, fieldId }) => {
                const value = renderFieldValue(
                  selectResourceField(line, { fieldId }),
                )

                return value && { key: name, value }
              })
              .filter(isTruthy),
          } satisfies LineViewModel
        }),
      ),
      notes: renderTemplateField(order, fields.purchaseNotes),
      termsAndConditions: renderTemplateField(order, fields.termsAndConditions),
      subtotal: renderTemplateField(order, fields.subtotalCost),
      accountAddress: account.address,
      accountName: account.name,
      currency: renderTemplateField(order, fields.currency),
      paymentTerms: renderTemplateField(order, fields.paymentTerms),
      number: renderTemplateField(order, fields.poNumber),
      issuedDate: renderTemplateField(order, fields.issuedDate),
      total: renderTemplateField(order, fields.totalCost),
      vendorName: renderTemplateField(vendor, fields.name),
      taxable: renderTemplateField(order, fields.taxable),
      shippingAddress: renderAddressViewModel(order, fields.shippingAddress),
      costs: order.costs.map((cost) => ({
        key: cost.name,
        value: (cost.isPercentage
          ? (selectResourceFieldValue(order, fields.subtotalCost)?.number ??
              0) *
            (cost.value / 100)
          : cost.value
        ).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
      })),
      incoterms: renderTemplateField(order, fields.incoterms),
      shippingMethod: renderTemplateField(order, fields.shippingMethod),
      shippingAccountNumber: renderTemplateField(
        order,
        fields.shippingAccountNumber,
      ),
      poRecipientName: renderTemplateField(order, fields.poRecipient),
      vendorPrimaryAddress: renderAddressViewModel(
        vendor,
        fields.primaryAddress,
      ),
      vendorReferenceNumber: renderTemplateField(
        vendor,
        fields.customerReferenceNumber,
      ),
      billingAddress: renderAddressViewModel(order, fields.billingAddress),
      paymentMethod: renderTemplateField(order, fields.paymentMethod),
      isPreview: isPreview ?? false,
    }
  }
}

const renderTemplateField = (
  resource: Resource | undefined,
  fieldRef: FieldReference,
) => renderFieldValue(resource && selectResourceField(resource, fieldRef))

const renderFieldValue = (resourceField: ResourceField | undefined) =>
  match<FieldType | undefined, string | null>(resourceField?.fieldType)
    .with('Address', () =>
      resourceField?.value?.address
        ? formatInlineAddress(resourceField.value.address)
        : null,
    )
    .with('Checkbox', () =>
      match(resourceField?.value.boolean)
        .with(true, () => 'Yes')
        .with(false, () => 'No')
        .with(P.nullish, () => null)
        .exhaustive(),
    )
    .with('Contact', () => resourceField?.value?.contact?.name || null)
    .with('Date', () =>
      resourceField?.value?.date
        ? new Date(resourceField.value.date).toLocaleDateString()
        : null,
    )
    .with('File', () => (resourceField?.value?.file ? 'File Attached' : null))
    .with('Files', () =>
      resourceField?.value?.files?.length ? 'Files Attached' : null,
    )
    .with(
      'Money',
      () =>
        resourceField?.value?.number?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }) ?? null,
    )
    .with('Number', () => resourceField?.value?.number?.toString() ?? null)
    .with(
      'MultiSelect',
      () =>
        resourceField?.value?.options?.map((o) => o.name).join(', ') ?? null,
    )
    .with('Text', () => resourceField?.value?.string || null)
    .with('Textarea', () => resourceField?.value?.string || null)
    .with('Select', () => resourceField?.value?.option?.name ?? null)
    .with('User', () => resourceField?.value?.user?.name ?? null)
    .with('Resource', () => null)
    .with(P.nullish, () => null)
    .exhaustive()

const renderAddressViewModel = (
  resource: Resource | undefined,
  field: FieldReference,
): AddressViewModel => {
  if (!resource)
    return {
      line1: null,
      line2: null,
      line3: null,
    }

  const addressValue = selectResourceFieldValue(resource, field)?.address
  const line2Values = [
    addressValue?.city,
    addressValue?.state,
    addressValue?.zip,
  ].filter(Boolean)

  return {
    line1: addressValue?.streetAddress ?? null,
    line2: line2Values.length ? line2Values.join(' ') : null,
    line3: addressValue?.country ?? null,
  }
}
