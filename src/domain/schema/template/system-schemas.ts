import { fields } from './system-fields'
import { SchemaTemplate } from './types'

export const schemas: SchemaTemplate[] = [
  {
    resourceType: 'Bill',
    fields: [
      fields.order,
      fields.billStatus,
      fields.itemizedCosts,
      fields.subtotalCost,
      fields.totalCost,
      fields.assignee,
      fields.billAttachments,
    ],
    sections: [
      {
        name: 'Bill Info',
        fields: [
          fields.billFiles,
          fields.vendor,
          fields.invoiceNumber,
          fields.invoiceDate,
          fields.billDescription,
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
      fields.order,
      fields.bill,
    ],
  },
  {
    resourceType: 'Order',
    fields: [
      fields.orderStatus,
      fields.number,
      fields.assignee,
      fields.document,
      fields.totalCost,
      fields.subtotalCost,
      fields.itemizedCosts,
      fields.trackingNumber,
      fields.orderAttachments,
    ],
    sections: [
      {
        name: 'Order Info',
        fields: [
          fields.vendor,
          fields.orderDescription,
          fields.issuedDate,
          fields.orderNotes,
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
          fields.poRecipient,
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
    fields: [],
    sections: [
      {
        name: 'Summary',
        fields: [fields.name, fields.vendorDescription, fields.primaryAddress],
      },
      {
        name: 'Contacts',
        fields: [fields.poRecipient],
      },
      {
        name: 'Payment Info',
        fields: [fields.paymentTerms, fields.paymentMethod],
      },
    ],
  },
]
