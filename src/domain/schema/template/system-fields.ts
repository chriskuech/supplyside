import { deepStrictEqual } from 'assert'
import { entries, filter, flatMap, groupBy, map, mapValues, pipe } from 'remeda'
import { FieldTemplate } from './types'

// Define a templateId on macOS with
//   `uuidgen | awk '{print tolower($0)}'`

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

export const orderStatusOptions = {
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
  ordered: {
    templateId: '37551c24-8610-4952-abcb-a9e54c086272',
    name: 'Ordered',
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
  billDescription: {
    templateId: 'cd1c7d34-57bf-43ad-8b32-a90081cde55b',
    name: 'Bill Description',
    type: 'Textarea',
    description: 'Brief, identifiable description of the bill',
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
  currency: {
    templateId: '52b10289-99a0-4dfe-bb6b-6afca34e8501',
    name: 'Currency',
    type: 'Select',
    description: 'Type of currency for the transaction',
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
  itemizedCosts: {
    templateId: '25a46eb4-2eca-40a8-9596-cda2a524facd',
    name: 'Itemized Costs',
    type: 'Money',
    description: 'Individual costs not tied to line items',
    isDerived: true,
  },
  line: {
    templateId: '30fba00b-ca2f-48d1-a795-77e5843880ce',
    name: 'Line',
    type: 'Resource',
    description: 'Contains all info related to a specific line item',
    resourceType: 'Line',
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
  },
  number: {
    templateId: 'c056ca91-7f40-45d2-ae01-cd4bc66c09f2',
    name: 'Number',
    type: 'Text',
    description: 'Unique number for a specific resource',
  },
  order: {
    templateId: '2f1954ab-e156-4d23-a3da-45e8168fcfdd',
    name: 'Order',
    type: 'Resource',
    resourceType: 'Order',
    description: 'Contains all info related to a specific order',
  },
  orderAttachments: {
    templateId: '3a0f3e04-b4ac-4266-9d4e-bac5091d0922',
    name: 'Order Attachments',
    type: 'Files',
  },
  orderDescription: {
    templateId: 'f7b4e0f7-e1e7-4e1e-abad-4e0f7e1e7e5d',
    name: 'Order Description',
    type: 'Textarea',
    description: 'Brief, identifiable internal order description',
  },
  orderNotes: {
    templateId: '3749e137-c1d8-474a-9539-ba9b82cd6e94',
    name: 'Order Notes',
    type: 'Textarea',
    description: 'Order notes included in the purchase order header',
  },
  orderStatus: {
    templateId: 'd51e1004-c999-4ac1-8692-ff3d966c5dc3',
    name: 'Order Status',
    type: 'Select',
    description: 'Lifecycle states of an order',
    options: Object.values(orderStatusOptions),
    defaultValue: {
      optionTemplateId: orderStatusOptions.draft.templateId,
    },
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
    type: 'Select',
    description: 'Payment terms expressed in days',
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
    type: 'Textarea',
    description: "The vendor's primary physical address",
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
  },
  quickBooksVendorId: {
    templateId: '392bfedc-3b4f-46c9-a0a9-9bfa2eeb0896',
    name: 'QuickBooks vendor ID',
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
    type: 'Textarea',
    description: 'Indicates the ship-to address on the order',
  },
  shippingMethod: {
    templateId: '01bcb707-bd68-4726-8220-65bd19eee224',
    name: 'Shipping Method',
    type: 'Select',
    description: 'Required form of shipping',
  },
  shippingNotes: {
    templateId: '0d5a6944-49e6-45bc-ac1e-5ed1c2ccc55c',
    name: 'Shipping Notes',
    type: 'Textarea',
    description: 'Shipping notes included in the purchase order header',
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

export const findField = (templateId: string | null | undefined) =>
  templateId
    ? Object.values(fields).find((field) => field.templateId === templateId)
    : undefined

// Ensure that the templateIds are unique
deepStrictEqual(
  pipe(
    [fields, billStatusOptions, orderStatusOptions],
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
