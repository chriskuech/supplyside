import { fields } from './fields'
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
    resourceType: 'Customer',
    fields: [fields.quickBooksCustomerId],
    sections: [
      {
        name: 'Summary',
        fields: [
          fields.name,
          fields.customerDescription,
          fields.primaryAddress,
        ],
      },
      {
        name: 'Contacts',
        fields: [fields.primaryContact],
      },
      {
        name: 'Payment Info',
        fields: [fields.paymentTerms, fields.paymentMethod],
      },
    ],
  },
  {
    resourceType: 'Item',
    sections: [
      {
        name: 'Summary',
        fields: [
          fields.name,
          fields.itemDescription,
          fields.unitOfMeasure,
          fields.itemNumber,
          fields.otherNotes,
        ],
      },
    ],
  },
  {
    resourceType: 'Job',
    fields: [fields.jobStatus, fields.jobAttachments],
    sections: [
      {
        name: 'Job Info',
        fields: [
          fields.name,
          fields.jobDescription,
          fields.needDate,
          fields.totalCost,
          fields.customer,
          fields.paymentTerms,
          fields.paymentDueDate,
        ],
      },
    ],
  },
  {
    resourceType: 'JobLine',
    fields: [
      fields.job,
      fields.part,
      fields.quantity,
      fields.unitCost,
      fields.totalCost,
    ],
  },
  {
    resourceType: 'Part',
    sections: [
      {
        name: 'Part Info',
        fields: [
          fields.name,
          fields.partNumber,
          fields.revision,
          fields.partFiles,
        ],
      },
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
      fields.punchoutSessionUrl,
      fields.job,
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
          fields.needDate,
        ],
      },
      {
        name: 'Billing Info',
        fields: [
          fields.billingAddress,
          fields.currency,
          fields.paymentTerms,
          fields.paymentDueDate,
          fields.paymentMethod,
          fields.taxable,
        ],
      },
      {
        name: 'Shipping Info',
        fields: [
          fields.shippingAddress,
          fields.shippingMethod,
          fields.shippingAccountNumber,
          fields.incoterms,
        ],
      },
      {
        name: fields.termsAndConditions.name,
        fields: [fields.termsAndConditions],
      },
    ],
  },
  {
    resourceType: 'PurchaseLine',
    fields: [
      fields.itemName,
      fields.unitOfMeasure,
      fields.quantity,
      fields.unitCost,
      fields.totalCost,
      fields.needDate,
      fields.itemNumber,
      fields.otherNotes,
      fields.purchase,
      fields.bill,
    ],
  },
  {
    resourceType: 'Vendor',
    fields: [fields.quickBooksVendorId],
    sections: [
      {
        name: 'Summary',
        fields: [
          fields.name,
          fields.vendorDescription,
          fields.primaryAddress,
          fields.customerReferenceNumber,
        ],
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
