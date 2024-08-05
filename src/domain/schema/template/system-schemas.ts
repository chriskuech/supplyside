import { fields } from './system-fields'
import { SchemaTemplate } from './types'

export const schemas: SchemaTemplate[] = [
  {
    resourceType: 'Bill',
    sections: [
      {
        name: 'Summary',
        fields: [
          fields.number,
          fields.document,
          fields.order,
          fields.vendor,
          fields.issuedDate,
        ],
      },
    ],
  },
  {
    resourceType: 'Item',
    sections: [
      {
        name: 'Summary',
        fields: [fields.name, fields.description, fields.unitOfMeasure],
      },
    ],
  },
  {
    resourceType: 'Line',
    fields: [
      fields.item,
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
    ],
    sections: [
      {
        name: 'Order Info',
        fields: [
          fields.vendor,
          fields.description,
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
        name: 'Terms & Conditions',
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
        fields: [fields.name, fields.description, fields.primaryAddress],
      },
      {
        name: 'Contacts',
        fields: [fields.poRecipient],
      },
      {
        name: 'Payment Info',
        fields: [fields.paymentTerms, fields.preferredPaymentType],
      },
    ],
  },
]
