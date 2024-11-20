import { fields } from '@supplyside/model'

export const relations = [
  {
    parent: 'Job',
    child: 'Part',
    link: fields.job,
    syncedFields: [fields.customer, fields.needDate],
    syncType: 'sync',
  },
  {
    parent: 'Purchase',
    child: 'PurchaseLine',
    link: fields.purchase,
    syncedFields: [fields.vendor, fields.needDate],
    syncType: 'sync',
  },
  {
    parent: 'Vendor',
    child: 'Purchase',
    link: fields.vendor,
    syncedFields: [
      fields.paymentTerms,
      fields.paymentMethod,
      fields.poRecipient,
    ],
    syncType: 'once',
  },
  {
    parent: 'Customer',
    child: 'Job',
    link: fields.customer,
    syncedFields: [
      fields.paymentTerms,
      // (BUG?) these are specced but not in the schema
      // fields.paymentMethod,
      // fields.primaryContact,
    ],
    syncType: 'once',
  },
] as const
