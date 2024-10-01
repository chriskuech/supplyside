import { readFile, writeFile } from 'fs/promises'
import { isTruthy } from 'remeda'
import { P, match } from 'ts-pattern'
import { FieldType } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { BlobService } from '../blob/BlobService'
import { ResourceService } from '../resource/ResourceService'
import { AccountService } from '../account/AccountService'
import { SchemaService } from '../schema/SchemaService'
import {
  FieldReference,
  Resource,
  ResourceField,
  fields,
  formatInlineAddress,
  selectResourceField,
  selectResourceFieldValue,
} from '@supplyside/model'
import {
  AddressViewModel,
  LineViewModel,
  PurchaseViewModel,
} from './doc/ViewModel'
import { OsService } from '@supplyside/api/os'

@injectable()
export class PoRenderingService {
  constructor(
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(OsService) private readonly osService: OsService
  ) {}

  async renderPo(
    accountId: string,
    resourceId: string,
    { isPreview }: { isPreview?: boolean } = {},
  ) {
    return await this.osService.withTempDir(async (path) => {
      const viewModel = await this.createViewModel(accountId, resourceId)

      // TODO: render to html
      // const html = htmlDocument(
      //   renderToStaticMarkup(PoDocument(viewModel)),
      //   isPreview
      // )
      const html = `${viewModel.number}${isPreview}`

      await writeFile(`${path}/out.html`, html)

      await this.osService.exec(
        `weasyprint '${path}/out.html' '${path}/out.pdf'`
      )

      return await readFile(`${path}/out.pdf`)
    })
  }

  async createViewModel(
    accountId: string,
    purchaseId: string
  ): Promise<PurchaseViewModel> {
    const [order, lines, lineSchema, account] = await Promise.all([
      this.resourceService.readResource({
        accountId,
        id: purchaseId,
        type: 'Purchase',
      }),
      this.resourceService.readResources({
        accountId,
        type: 'Line',
        where: {
          '==': [{ var: 'Purchase' }, purchaseId],
        },
      }),
      this.schemaService.readSchema(accountId, 'Line'),
      this.accountService.read(accountId),
    ])

    const vendorId = selectResourceFieldValue(order, fields.vendor)?.resource
      ?.id

    const vendor = vendorId
      ? await this.resourceService.readResource({
          accountId: account.id,
          id: vendorId,
          type: 'Vendor',
        })
      : undefined

    const blob = account.logoBlobId
      ? await this.blobService.readBlobWithData(account.id, account.logoBlobId)
      : undefined

    const lineAdditionalFields = lineSchema.fields.filter(
      (field) =>
        ![
          fields.totalCost.templateId,
          fields.unitOfMeasure.templateId,
          fields.unitCost.templateId,
          fields.quantity.templateId,
        ].includes(field.templateId as string)
    )

    return {
      logoBlobDataUrl: account?.logoBlobId
        ? `data:${blob?.mimeType};base64,${blob?.buffer.toString('base64')}`
        : null,
      lines: await Promise.all(
        lines.map(async (line) => {
          const itemId = selectResourceFieldValue(line, fields.item)?.resource
            ?.id

          const item = itemId
            ? await this.resourceService.readResource({
                accountId: account.id,
                id: itemId,
                type: 'Item',
              })
            : undefined

          return {
            itemName: renderTemplateField(item, fields.name),
            itemDescription: renderTemplateField(item, fields.itemDescription),
            quantity: renderTemplateField(line, fields.quantity),
            unitOfMeasure: renderTemplateField(line, fields.unitOfMeasure),
            unitCost: renderTemplateField(line, fields.unitCost),
            totalCost: renderTemplateField(line, fields.totalCost),
            additionalFields: lineAdditionalFields
              .map(({ name, fieldId }) => {
                const value = renderFieldValue(
                  selectResourceField(line, { fieldId })
                )

                return value && { key: name, value }
              })
              .filter(isTruthy),
          } satisfies LineViewModel
        })
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
        fields.shippingAccountNumber
      ),
      shippingNotes: renderTemplateField(order, fields.shippingNotes),
      poRecipientName: renderTemplateField(order, fields.poRecipient),
      vendorPrimaryAddress: renderAddressViewModel(
        vendor,
        fields.primaryAddress
      ),
    }
  }
}

// const htmlDocument = (content: string, isPreview?: boolean) => `
//   <!DOCTYPE html>
//   <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <title>Purchase Order</title>
//       <style>
//         .page-counter::after {
//           content: "Page " counter(page) " of " counter(pages);
//         }

//         @page {
//           size: Letter;
//           margin: 15px;
//         }

//         body {
//           ${
//             isPreview
//               ? `background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(
//                   watermark
//                 )}');`
//               : ''
//           }
//           margin: 0;
//           padding: 0;
//           height: 100%;
//           font-family: Arial, sans-serif;
//           font-size: 12px;
//         }
//       </style>
//     </head>
//     <body>
//       ${content}
//     </body>
//   </html>
// `

// const watermark = `
//   <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
//     <rect width="100%" height="100%" fill="none"/>
//     <text x="100" y="100" font-family="sans-serif" font-size="40" fill="rgba(0,0,0,0.2)" font-weight="bold" text-anchor="middle" dominant-baseline="middle" transform="rotate(-27 100 100)">PREVIEW</text>
//   </svg>
// `

const renderTemplateField = (
  resource: Resource | undefined,
  fieldRef: FieldReference
) => renderFieldValue(resource && selectResourceField(resource, fieldRef))

const renderFieldValue = (resourceField: ResourceField | undefined) =>
  match<FieldType | undefined, string | null>(resourceField?.fieldType)
    .with('Address', () =>
      resourceField?.value?.address
        ? formatInlineAddress(resourceField.value.address)
        : null
    )
    .with('Checkbox', () =>
      match(resourceField?.value.boolean)
        .with(true, () => 'Yes')
        .with(false, () => 'No')
        .with(P.nullish, () => null)
        .exhaustive()
    )
    .with('Contact', () => resourceField?.value?.contact?.name || null)
    .with('Date', () =>
      resourceField?.value?.date
        ? new Date(resourceField.value.date).toLocaleDateString()
        : null
    )
    .with('File', () => (resourceField?.value?.file ? 'File Attached' : null))
    .with('Files', () =>
      resourceField?.value?.files?.length ? 'Files Attached' : null
    )
    .with(
      'Money',
      () =>
        resourceField?.value?.number?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }) ?? null
    )
    .with('Number', () => resourceField?.value?.number?.toString() ?? null)
    .with(
      'MultiSelect',
      () => resourceField?.value?.options?.map((o) => o.name).join(', ') ?? null
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
  field: FieldReference
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
