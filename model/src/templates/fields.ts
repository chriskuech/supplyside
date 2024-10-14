import { deepStrictEqual } from 'assert'
import { entries, filter, flatMap, groupBy, map, mapValues, pipe } from 'remeda'
import { FieldTemplate } from './types'

// Gen a new templateId and copy it to the clipboard on macOS
//   `uuidgen | awk '{print tolower($0)}' | tr -d '\n' | pbcopy`

export const billStatusOptions = {
  draft: {
    templateId: 'abababbb-3f5e-4d2d-8f0f-3e8f2c4c4b5c',
    name: 'Draft',
  },
  submitted: {
    templateId: '45b2ab63-6c20-4548-aafa-027286d03759',
    name: 'Submitted',
  },
  approved: {
    templateId: 'd4c4b6f7-4e1e-4e1e-8f7b-4e0f7e1e7e5d',
    name: 'Approved',
  },
  paid: {
    templateId: 'd4c4b6f7-4e2e-4e1e-8f7a-ae0f7e1e7e5d',
    name: 'Paid',
  },
  canceled: {
    templateId: 'e8b7c2c8-0b7b-4e9a-8e8d-7b2fffff6f4e',
    name: 'Canceled',
  },
}

export const jobStatusOptions = {
  draft: {
    templateId: '6280f9fb-5d27-4d0c-8d7e-12ceb064dc5e',
    name: 'Draft',
  },
  ordered: {
    templateId: '1a18eb92-20c3-418d-aff2-723520d21207',
    name: 'Ordered',
  },
  inProcess: {
    templateId: '254645f8-c9ab-4af2-b86b-6eb77354d4d4',
    name: 'In Process',
  },
  shipped: {
    templateId: '71921302-1e57-41bf-8c22-ef2b6f268ba3',
    name: 'Shipped',
  },
  invoiced: {
    templateId: 'deeba092-2e81-4476-8962-4b6a7d1e8f29',
    name: 'Invoiced',
  },
  paid: {
    templateId: 'fd87e2ab-13e5-4f3f-9e5c-ab96684f9e4e',
    name: 'Paid',
  },
  canceled: {
    templateId: '70912291-2b48-4e1f-9300-b7dbca8ce5ab',
    name: 'Canceled',
  },
}

export const purchaseStatusOptions = {
  draft: {
    templateId: '84c65f46-b8dd-43bf-9bbe-537b816fdeb5',
    name: 'Draft',
  },
  submitted: {
    templateId: '45b2ab63-6c20-4548-8427-027286d03759',
    name: 'Submitted',
  },
  approved: {
    templateId: '9946f309-a3e4-4fdf-991a-cc9d3df80ec0',
    name: 'Approved',
  },
  purchased: {
    templateId: '37551c24-8610-4952-abcb-a9e54c086272',
    name: 'Purchased',
  },
  received: {
    templateId: 'f3f9b5a6-6b0e-4d4d-8d4e-2f7f3b1b7a3a',
    name: 'Received',
  },
  canceled: {
    templateId: 'e8b7c2c8-0b7b-4e9a-8e8d-7b2f5e1f6f4e',
    name: 'Canceled',
  },
}

export const unitOfMeasureOptions = {
  box: {
    templateId: 'cae404de-3fdd-4bea-aff4-3b3e08ee6dd4',
    name: 'box',
  },
  each: {
    templateId: '06c5c8f9-5cd7-4c05-994e-ee9adb906390',
    name: 'each',
  },
  yard: {
    templateId: '74bc9dcb-54cd-4201-96a4-60420dd2eec4',
    name: 'yard',
  },
  foot: {
    templateId: '89f9c5b8-6be3-49b0-b979-b9275d98d5ac',
    name: 'foot',
  },
  inch: {
    templateId: '8193a87b-f009-4aa1-a65d-0ee37e63721d',
    name: 'inch',
  },
  centimeter: {
    templateId: '6ba976a9-1ec6-4a46-b91e-8197792488d9',
    name: 'centimeter',
  },
  pack: {
    templateId: '3cfcfe4d-88aa-42e9-b415-722d87797660',
    name: 'pack',
  },
  pair: {
    templateId: 'fdc4b46d-f46b-4856-b6f5-b8a15443f350',
    name: 'pair',
  },
  roll: {
    templateId: 'efa7b2c3-4930-45c3-a5b6-c17292df3e47',
    name: 'roll',
  },
  squareInch: {
    templateId: 'ad47b3eb-aa99-46f5-9602-d36731bd9a5d',
    name: 'square inch',
  },
  set: {
    templateId: '068c3985-2f31-4fcc-a5ea-e09d6dd2edb7',
    name: 'set',
  },
  squareFoot: {
    templateId: '1e7be07c-c121-4a6f-8af2-239e5da18a4e',
    name: 'square foot',
  },
}

const _fields = {
  assignee: {
    templateId: '726e01bc-66cb-4114-b900-10102f9c081c',
    name: 'Assignee',
    type: 'User',
    description: 'Primary person managing the resource',
  },
  bill: {
    templateId: '50292f4a-f926-4d0f-a6e9-6b7a48f8b4c4',
    name: 'Bill',
    type: 'Resource',
    resourceType: 'Bill',
    description: 'Contains all bill related info from a vendor',
  },
  billAttachments: {
    templateId: '9deb8b41-c6c2-4c72-a058-9a14acc4f89b',
    name: 'Bill Attachments',
    type: 'Files',
  },
  billFiles: {
    templateId: 'b4c4a6e9-6b7a-4f8b-92f4-a9264d0fa6e9',
    name: 'Bill Files',
    type: 'Files',
    description: 'The final purchase order document',
  },
  billStatus: {
    templateId: 'f2b7c7b4-3f5e-4d2d-8f0f-3e8f2c4c4b5c',
    name: 'Bill Status',
    type: 'Select',
    description: 'Lifecycle statuses of a bill',
    options: Object.values(billStatusOptions),
    defaultValue: {
      optionTemplateId: billStatusOptions.draft.templateId,
    },
  },
  billingAddress: {
    templateId: 'b0069350-92a0-4d02-8eae-c2a04405c94b',
    name: 'Billing Address',
    type: 'Address',
    description: 'Indicates the ship-to address on the order',
  },
  billingContact: {
    templateId: 'de26b300-e05b-4d50-9289-3f940c7b0901',
    name: 'Billing Contact',
    type: 'Contact',
  },
  currency: {
    templateId: '52b10289-99a0-4dfe-bb6b-6afca34e8501',
    name: 'Currency',
    type: 'Select',
    description: 'Type of currency for the transaction',
  },
  customer: {
    templateId: '0e3369ca-99b1-4cb7-9a18-a2b10d70fed3',
    name: 'Customer',
    type: 'Resource',
    resourceType: 'Customer',
    description: 'Primary customer for the transaction',
    isRequired: true,
  },
  customerDescription: {
    templateId: '79a53e8a-5b96-4759-8b81-5cdeda01ed34',
    name: 'Customer Description',
    type: 'Textarea',
    description: 'Brief, identifiable description of the customer',
  },
  customerReferenceNumber: {
    templateId: 'cb1b5458-b938-4b5b-aa50-41065f4a84c8',
    name: 'Customer Reference Number',
    type: 'Text',
  },
  document: {
    templateId: 'cb4a0c88-df20-485d-9881-e2c3b1b2b180',
    name: 'Document',
    type: 'File',
  },
  incoterms: {
    templateId: '9f1af7c6-c04c-45cc-a97b-188c3a16aaad',
    name: 'Incoterms',
    type: 'Select',
    description: 'International commercial terms',
  },
  invoiceDate: {
    templateId: 'c2b2f1b5-7d2f-4b3b-9d8e-4a8f9e3c0b7b',
    name: 'Invoice Date',
    type: 'Date',
    isRequired: true,
    defaultToToday: true,
    description: 'Date the invoice was issued',
  },
  invoiceNumber: {
    templateId: 'f4d0d4a0-7f2b-4e0c-8f6a-8c6d4e0b7f2b',
    name: 'Invoice Number',
    type: 'Text',
    description: "Vendor's original invoice number",
  },
  issuedDate: {
    templateId: '6c2f58e8-2f6e-47cc-b109-904e74d1067b',
    name: 'Issued Date',
    type: 'Date',
    description: 'Date the order was issued',
  },
  item: {
    templateId: '9ffd1faf-b650-4a90-ad04-6153aad93c84',
    name: 'Item',
    type: 'Resource',
    resourceType: 'Item',
    description: 'Contains all info related to a specific item',
  },
  itemDescription: {
    templateId: 'f7b4e0f7-a1b1-4e1e-8f7b-4e0f7e1e7e5d',
    name: 'Item Description',
    type: 'Textarea',
    description: 'Brief, identifiable description of the item',
  },
  itemName: {
    templateId: '403dd522-a972-4a24-8012-936f56135d41',
    name: 'Item Name',
    type: 'Text',
    description: 'Unique identifier for a item',
  },
  itemNumber: {
    templateId: '9e0115e1-e10c-4e21-a399-47ad9bfc1a6f',
    name: 'Item Number',
    type: 'Text',
    description: 'Unique identifier for a item',
  },
  itemizedCosts: {
    templateId: '25a46eb4-2eca-40a8-9596-cda2a524facd',
    name: 'Itemized Costs',
    type: 'Money',
    description: 'Individual costs not tied to line items',
    isDerived: true,
  },
  job: {
    templateId: 'f4792227-7a56-414f-84b9-11e52c949a0d',
    name: 'Job',
    type: 'Resource',
    resourceType: 'Job',
    description: 'Contains all info related to a specific job',
  },
  jobAttachments: {
    templateId: '1b0f9594-ac0d-44ef-b45a-574773d1a6a0',
    name: 'Job Attachments',
    type: 'Files',
  },
  jobDescription: {
    templateId: '4522e8be-d0c4-428f-9f54-7ddbfec39687',
    name: 'Job Description',
    type: 'Textarea',
    description: 'Brief, identifiable description of the job',
  },
  jobStatus: {
    templateId: '70912291-2b48-4e1f-9300-b7dbca8ce5ab',
    name: 'Job Status',
    type: 'Select',
    description: 'Lifecycle states of a job',
    options: Object.values(jobStatusOptions),
    defaultValue: {
      optionTemplateId: jobStatusOptions.draft.templateId,
    },
    isRequired: true,
  },
  line: {
    templateId: '30fba00b-ca2f-48d1-a795-77e5843880ce',
    name: 'Line',
    type: 'Resource',
    description: 'Contains all info related to a specific line item',
    resourceType: 'PurchaseLine',
  },
  name: {
    templateId: 'aebb8b9f-d49a-4d5b-b6cf-453bfad847b4',
    name: 'Name',
    type: 'Text',
    description: 'Primary, identifiable name of a resource',
  },
  needDate: {
    templateId: 'f2a3f4a9-3d6e-4e3d-8f7b-4e0f7e1e7e5d',
    name: 'Need Date',
    type: 'Date',
    description: 'Represents the latest delivery date',
    isRequired: true,
  },
  otherNotes: {
    templateId: 'ca79749f-b8f0-4a76-b4bf-080fae2d229b',
    name: 'Other Notes',
    type: 'Textarea',
    description: 'Other notes included in the purchase order header',
  },
  part: {
    templateId: 'fc0189d7-1535-4c3e-8561-d6427be78de8',
    name: 'Part',
    type: 'Resource',
    resourceType: 'Part',
    isRequired: true,
  },
  partFiles: {
    templateId: '2338256d-f93b-410f-8743-7c39dea26c9d',
    name: 'Part Files',
    type: 'Files',
  },
  partNumber: {
    templateId: 'f84c023e-a3a6-484b-ace2-abb4aa1fb425',
    name: 'Part Number',
    type: 'Text',
    description: 'Unique identifier for a part',
  },
  poNumber: {
    templateId: 'c056ca91-7f40-45d2-ae01-cd4bc66c09f2',
    name: 'PO Number',
    type: 'Text',
    description: 'Unique identifier for a Purchase Order',
  },
  paymentDueDate: {
    templateId: 'e2c3b1b2-180c-4a8f-9e3c-0b7bcb4a0c88',
    name: 'Payment Due Date',
    type: 'Date',
    isRequired: true,
    description: 'Vendor bill payment due date',
  },
  paymentMethod: {
    templateId: '6afca34e-8501-4dfe-bb6b-2b1028999a08',
    name: 'Payment Method',
    type: 'Select',
    description: 'Required form of payment',
  },
  paymentTerms: {
    templateId: '8a9c85a4-1aea-4c0c-9cd2-51c6943aaaf7',
    name: 'Payment Terms',
    type: 'Number',
    description: 'Payment terms expressed in days',
    prefix: 'Net',
  },
  poRecipient: {
    templateId: 'b735b67c-be50-4859-9242-00572b4d32cb',
    name: 'PO Recipient',
    type: 'Contact',
    description: 'Primary vendor recipient for orders',
  },
  primaryAddress: {
    templateId: '58e1e7ae-2dab-44e2-b741-e47eddd7a626',
    name: 'Primary Address',
    type: 'Address',
    description: "The vendor's primary physical address",
  },
  primaryContact: {
    templateId: 'b36205ce-50b8-45cf-beb2-c2ad927aeb34',
    name: 'Primary Contact',
    type: 'Contact',
    description: 'Primary contact for orders',
  },
  punchoutSessionUrl: {
    templateId: '51955a67-a243-4544-992a-3d15720e4a2d',
    name: 'Punchout Session URL',
    type: 'Text',
  },
  purchase: {
    templateId: '2f1954ab-e156-4d23-a3da-45e8168fcfdd',
    name: 'Purchase',
    type: 'Resource',
    resourceType: 'Purchase',
    description: 'Contains all info related to a specific order',
  },
  purchaseAttachments: {
    templateId: '3a0f3e04-b4ac-4266-9d4e-bac5091d0922',
    name: 'Purchase Attachments',
    type: 'Files',
  },
  purchaseDescription: {
    templateId: 'f7b4e0f7-e1e7-4e1e-abad-4e0f7e1e7e5d',
    name: 'Purchase Description',
    type: 'Textarea',
    description: 'Brief, identifiable internal order description',
  },
  purchaseNotes: {
    templateId: '3749e137-c1d8-474a-9539-ba9b82cd6e94',
    name: 'Purchase Notes',
    type: 'Textarea',
    description: 'Purchase notes included in the purchase order header',
  },
  purchaseStatus: {
    templateId: 'd51e1004-c999-4ac1-8692-ff3d966c5dc3',
    name: 'Purchase Status',
    type: 'Select',
    description: 'Lifecycle states of an order',
    options: Object.values(purchaseStatusOptions),
    defaultValue: {
      optionTemplateId: purchaseStatusOptions.draft.templateId,
    },
  },
  quantity: {
    templateId: '8c04f743-23a3-417f-8fd9-98cd5ffa4a67',
    name: 'Quantity',
    type: 'Number',
    description: 'The number of units purchased of an item',
  },
  quickBooksAccount: {
    templateId: '3cf75b8f-f4e4-406f-a1db-0761aa6db523',
    name: 'Accounting Category',
    type: 'Select',
    isRequired: true,
  },
  quickBooksBillId: {
    templateId: '421e7256-e918-4456-bb17-8feae1849ce0',
    name: 'QuickBooks Bill ID',
    type: 'Text',
  },
  quickBooksVendorId: {
    templateId: '392bfedc-3b4f-46c9-a0a9-9bfa2eeb0896',
    name: 'QuickBooks Vendor ID',
    type: 'Text',
  },
  quickBooksCustomerId: {
    templateId: '77c06a2a-f156-4425-a310-05e0315db9a0',
    name: 'QuickBooks Customer ID',
    type: 'Text',
  },
  revision: {
    templateId: '1abdda53-334a-49d7-9b8f-3edae4e3c384',
    name: 'Revision',
    type: 'Text',
  },
  shippingAccountNumber: {
    templateId: 'e6f5b7c4-8f5e-4f2d-8d0f-3e8f2c4c4b5c',
    name: 'Shipping Account Number',
    type: 'Select',
    description: 'Customer shipping number for a carrier',
  },
  shippingAddress: {
    templateId: '848fe67b-ee4f-4c68-bdaa-3089622337f6',
    name: 'Shipping Address',
    type: 'Address',
    description: 'Indicates the ship-to address on the order',
  },
  shippingMethod: {
    templateId: '01bcb707-bd68-4726-8220-65bd19eee224',
    name: 'Shipping Method',
    type: 'Select',
    description: 'Required form of shipping',
  },
  subtotalCost: {
    templateId: '3234298a-d186-424e-a4b4-7678b4eec7d0',
    name: 'Subtotal Cost',
    type: 'Money',
    description: 'Sum of line item costs only',
    isDerived: true,
  },
  taxable: {
    templateId: '8e61b78c-6e8c-4863-a7fd-af55fa66503f',
    name: 'Taxable',
    type: 'Checkbox',
    description: 'Indicate if the order is taxable',
  },
  termsAndConditions: {
    templateId: '156bdd18-42d2-427b-bcfe-97b7214c401e',
    name: 'Terms & Conditions',
    type: 'Textarea',
    description: 'Terms language included on the purchase order',
  },
  totalCost: {
    templateId: '507b8699-64af-4f8f-9319-b63c48827c61',
    name: 'Total Cost',
    type: 'Money',
    description: 'Total value of a purchase',
    isDerived: true,
  },
  trackingNumber: {
    templateId: 'b34ecc5f-fad2-4cff-b4a5-1d14244c60c6',
    name: 'Tracking Number',
    type: 'Text',
    description: 'Unique number for tracking a shipment',
  },
  unitOfMeasure: {
    templateId: 'a5c3e3a8-6a0b-4b6d-9b3a-7a5f1f3f3d2e',
    name: 'Unit of Measure',
    type: 'Select',
    description: "Magnitude of an item's quantity",
    options: Object.values(unitOfMeasureOptions),
    isOptionsEditable: true,
  },
  unitCost: {
    templateId: '099a0fe9-85a4-4860-b874-49e5191b7ac2',
    name: 'Unit Cost',
    type: 'Money',
    description: 'Cost of an single item unit',
  },
  vendor: {
    templateId: 'a5961273-842e-4a14-a37f-6dd7db020db0',
    name: 'Vendor',
    type: 'Resource',
    resourceType: 'Vendor',
    description: 'Contains all info related to a specific vendor',
    isRequired: true,
  },
  vendorDescription: {
    templateId: 'f7b4e0f7-e1e7-4e1e-8f7b-4e0f7e1e7e5d',
    name: 'Vendor Description',
    type: 'Textarea',
    description: 'Brief, internal description of the vendor',
  },
} satisfies Record<string, FieldTemplate>

export const fields: Record<keyof typeof _fields, FieldTemplate> = _fields

export const findTemplateField = (templateId: string | null | undefined) =>
  templateId
    ? Object.values(fields).find((field) => field.templateId === templateId)
    : undefined

// Ensure that the templateIds are unique
deepStrictEqual(
  pipe(
    [fields, billStatusOptions, purchaseStatusOptions],
    flatMap((e) => Object.values(e)),
    map((e) => e.templateId),
    groupBy((e) => e),
    mapValues((group) => group.length),
    entries(),
    filter(([, count]) => count > 1),
    map(([templateId]) => templateId),
  ),
  [],
)

// Ensure that the field names are unique
deepStrictEqual(
  pipe(
    Object.values(fields),
    map((e) => e.name),
    groupBy((e) => e),
    mapValues((group) => group.length),
    entries(),
    filter(([, count]) => count > 1),
    map(([templateId]) => templateId),
  ),
  [],
)
