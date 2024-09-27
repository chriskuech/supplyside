import puppeteer, { Browser } from 'puppeteer'
// https://github.com/vercel/next.js/issues/43810
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
import ReactDom from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.production'
import { isTruthy } from 'remeda'
import { P, match } from 'ts-pattern'
import { FieldType } from '@prisma/client'
import { injectable } from 'inversify'
import { BlobService } from '../blob/BlobService'
import { ResourceService } from '../resource/ResourceService'
import { AccountService } from '../account'
import { SchemaService } from '../schema/SchemaService'
import {
  FieldRef,
  selectResourceField,
  selectResourceFieldValue,
} from '../resource/extensions'
import { fields } from '../schema/template/system-fields'
import { Resource, ResourceField } from '../resource/entity'
import PoDocument from './doc/PoDocument'
import {
  AddressViewModel,
  LineViewModel,
  PurchaseViewModel,
} from './doc/ViewModel'
import PoDocumentFooter from '@/domain/purchase/doc/PoDocumentFooter'
import { formatInlineAddress } from '@/lib/resource/fields/views/AddressCard'

export const browser = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = global as any

  if (!g.browser) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    })

    g.browser = browser
  }

  return g.browser as Browser
}

type RenderPoParams = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

@injectable()
export class PoRenderingService {
  constructor(
    private readonly blobService: BlobService,
    private readonly schemaService: SchemaService,
    private readonly accountService: AccountService,
    private readonly resourceService: ResourceService,
  ) {}

  async renderPo({ accountId, resourceId, isPreview }: RenderPoParams) {
    const [model, page] = await Promise.all([
      this.createViewModel(accountId, resourceId),
      browser().then((browser) => browser.newPage()),
    ])

    try {
      await page.setContent(
        htmlDocument(ReactDom.renderToString(PoDocument(model)), isPreview),
        { timeout: 300 },
      )

      const buffer = await page.pdf({
        format: 'letter',
        headerTemplate: '<div></div>',
        footerTemplate: ReactDom.renderToString(PoDocumentFooter(model)),
        displayHeaderFooter: true,
        margin: {
          top: '35px',
          bottom: '35px',
          left: '15px',
          right: '15px',
        },
        printBackground: true,
        timeout: 5_000,
      })

      return buffer
    } finally {
      page.close()
    }
  }

  async createViewModel(
    accountId: string,
    purchaseId: string,
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
      ? await this.blobService.readBlob({
          accountId: account.id,
          blobId: account.logoBlobId,
        })
      : undefined

    const lineAdditionalFields = lineSchema.allFields.filter(
      (field) =>
        ![
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
              .map(({ name, id: fieldId }) => {
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
      shippingNotes: renderTemplateField(order, fields.shippingNotes),
      poRecipientName: renderTemplateField(order, fields.poRecipient),
      vendorPrimaryAddress: renderAddressViewModel(
        vendor,
        fields.primaryAddress,
      ),
    }
  }
}

const htmlDocument = (content: string, isPreview?: boolean) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Purchase Order</title>
      <style>
        body {
          ${isPreview ? `background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(watermark)}');` : ''}
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
  </html>
`

const watermark = `
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="none"/>
    <text x="100" y="100" font-family="sans-serif" font-size="40" fill="rgba(0,0,0,0.2)" font-weight="bold" text-anchor="middle" dominant-baseline="middle" transform="rotate(-27 100 100)">PREVIEW</text>
  </svg>
`

const renderTemplateField = (
  resource: Resource | undefined,
  fieldRef: FieldRef,
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
    .with('User', () => resourceField?.value?.user?.fullName ?? null)
    .with('Resource', () => null)
    .with(P.nullish, () => null)
    .exhaustive()

const renderAddressViewModel = (
  resource: Resource | undefined,
  field: FieldRef,
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
