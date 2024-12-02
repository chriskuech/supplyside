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
      fields.recurring,
      fields.recurrenceInterval,
      fields.recurrenceIntervalUnits,
      fields.recurrenceIntervalOffsetInDays,
      fields.recurrenceStartedAt,
      fields.parentRecurrentBill,
      fields.parentClonedBill,
      fields.recurrenceLastExecutionDate,
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
    resourceType: 'Job',
    fields: [
      fields.name,
      fields.jobStatus,
      fields.jobAttachments,
      fields.itemizedCosts,
      fields.subtotalCost,
      fields.totalCost,
      fields.quickBooksInvoiceId,
      fields.startDate,
      fields.deliveryDate,
    ],
    sections: [
      {
        name: 'Job Info',
        fields: [fields.customer, fields.needDate, fields.customerPoNumber],
      },
      {
        name: 'Accounting Info',
        fields: [
          fields.quickBooksIncomeAccount,
          fields.paymentTerms,
          fields.paymentDueDate,
          fields.invoiceDate,
        ],
      },
      {
        name: 'Quality Info',
        fields: [
          fields.traceability,
          fields.coc,
          fields.fai,
          fields.materialTraceability,
          fields.hardware,
          fields.finishing,
          fields.inspection,
        ],
      },
    ],
  },
  {
    resourceType: 'Operation',
    fields: [
      fields.sequenceNumber,
      fields.completed,
      fields.operationName,
      fields.otherNotes,
      fields.operator,
      fields.dateCompleted,
      fields.workCenter,
      fields.step,
    ],
  },
  {
    resourceType: 'Part',
    fields: [
      fields.job,
      fields.partName,
      fields.totalCost,
      fields.customer,
      fields.startDate,
      fields.deliveryDate,
    ],
    sections: [
      {
        name: 'Part Info',
        fields: [
          fields.quantity,
          fields.unitCost,
          fields.needDate,
          fields.otherNotes,
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
      fields.vendor,
    ],
  },
  {
    resourceType: 'Step',
    fields: [
      fields.part,
      fields.completed,
      fields.workCenter,
      fields.purchase,
      fields.otherNotes,
      fields.startDate,
      fields.hours,
      fields.productionDays,
      fields.deliveryDate,
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
  {
    resourceType: 'WorkCenter',
    sections: [
      {
        name: 'Summary',
        fields: [fields.name],
      },
    ],
  },
]
