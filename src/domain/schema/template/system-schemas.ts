import { fields } from './system-fields'
import { SchemaTemplate } from './types'

export const schemas: SchemaTemplate[] = [
  {
    resourceType: 'Bill',
    fields: [
      fields.purchase,
      fields.billStatus,
      fields.itemizedCosts,
      fields.subtotalCost,
      fields.totalCost,
      fields.assignee,
      fields.billAttachments,
      fields.quickBooksBillId,
    ],
    sections: [
      {
        name: 'Bill Info',
        fields: [
          fields.billFiles,
          fields.vendor,
          fields.billingContact,
          fields.invoiceNumber,
          fields.invoiceDate,
          fields.poNumber,
          fields.purchaseDescription,
        ],
      },
      {
        name: 'Accounting Info',
        fields: [fields.quickBooksAccount],
      },
      {
        name: 'Payment Info',
        fields: [
          fields.paymentTerms,
          fields.paymentDueDate,
          fields.paymentMethod,
          fields.currency,
        ],
      },
    ],
  },
  {
    resourceType: 'Item',
    sections: [
      {
        name: 'Summary',
        fields: [fields.name, fields.itemDescription, fields.unitOfMeasure],
      },
    ],
  },
  {
    resourceType: 'Line',
    fields: [
      fields.item,
      fields.unitOfMeasure,
      fields.quantity,
      fields.unitCost,
      fields.totalCost,
      fields.needDate,
      fields.purchase,
      fields.bill,
    ],
  },
  {
    resourceType: 'Purchase',
    fields: [
      fields.purchaseStatus,
      fields.poNumber,
      fields.assignee,
      fields.document,
      fields.totalCost,
      fields.subtotalCost,
      fields.itemizedCosts,
      fields.trackingNumber,
      fields.purchaseAttachments,
    ],
    sections: [
      {
        name: 'Purchase Info',
        fields: [
          fields.vendor,
          fields.poRecipient,
          fields.purchaseDescription,
          fields.issuedDate,
          fields.purchaseNotes,
        ],
      },
      {
        name: 'Payment Info',
        fields: [fields.currency, fields.paymentTerms, fields.taxable],
      },
      {
        name: 'Shipping Info',
        fields: [
          fields.shippingAddress,
          fields.shippingMethod,
          fields.shippingAccountNumber,
          fields.incoterms,
          fields.shippingNotes,
        ],
      },
      {
        name: fields.termsAndConditions.name,
        fields: [fields.termsAndConditions],
      },
    ],
  },
  {
    resourceType: 'Vendor',
    fields: [fields.quickBooksVendorId],
    sections: [
      {
        name: 'Summary',
        fields: [fields.name, fields.vendorDescription, fields.primaryAddress],
      },
      {
        name: 'Contacts',
        fields: [fields.poRecipient, fields.billingContact],
      },
      {
        name: 'Payment Info',
        fields: [fields.paymentTerms, fields.paymentMethod],
      },
    ],
  },
]
