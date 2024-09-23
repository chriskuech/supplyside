import { P, match } from 'ts-pattern'
import { FieldType } from '@prisma/client'
import { isTruthy } from 'remeda'
import { Resource, ResourceField } from '../../resource/entity'
import { readResource, readResources } from '../../resource'
import { readSchema } from '../../schema'
import {
  FieldRef,
  selectResourceField,
  selectResourceFieldValue,
} from '../../resource/extensions'
import { fields } from '../../schema/template/system-fields'
import { readBlob } from '../../blobs'
import { LineViewModel, PurchaseViewModel } from './ViewModel'
import prisma from '@/services/prisma'

export const createViewModel = async (
  accountId: string,
  purchaseId: string,
): Promise<PurchaseViewModel> => {
  const [order, lines, lineSchema, account] = await Promise.all([
    readResource({
      accountId,
      id: purchaseId,
      type: 'Purchase',
    }),
    readResources({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: 'Purchase' }, purchaseId],
      },
    }),
    readSchema({ accountId, resourceType: 'Line' }),
    prisma().account.findUniqueOrThrow({
      where: { id: accountId },
    }),
  ])

  const vendorId = selectResourceFieldValue(order, fields.vendor)?.resource?.id

  const vendor = vendorId
    ? await readResource({
        accountId: account.id,
        id: vendorId,
        type: 'Vendor',
      })
    : undefined

  const blob = account.logoBlobId
    ? await readBlob({
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
        const itemId = selectResourceFieldValue(line, fields.item)?.resource?.id

        const item = itemId
          ? await readResource({
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
    shippingAddress: renderTemplateField(order, fields.shippingAddress),
    costs: order.costs.map((cost) => ({
      key: cost.name,
      value: (cost.isPercentage
        ? (selectResourceFieldValue(order, fields.subtotalCost)?.number ?? 0) *
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
    vendorPrimaryAddress: renderTemplateField(vendor, fields.primaryAddress),
  }
}

const renderTemplateField = (
  resource: Resource | undefined,
  fieldRef: FieldRef,
) => renderFieldValue(resource && selectResourceField(resource, fieldRef))

const renderFieldValue = (resourceField: ResourceField | undefined) =>
  match<FieldType | undefined, string | null>(resourceField?.fieldType)
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
