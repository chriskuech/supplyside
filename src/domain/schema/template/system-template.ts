import { FieldTemplate, SchemaTemplate } from './types'

// Define a templateId on macOS with
//   `uuidgen | awk '{print tolower($0)}'`
export const fields = {
  assignee: {
    templateId: '726e01bc-66cb-4114-b900-10102f9c081c',
    name: 'Assignee',
    type: 'User',
  },
  bill: {
    templateId: '50292f4a-f926-4d0f-a6e9-6b7a48f8b4c4',
    name: 'Bill',
    type: 'Resource',
    resourceType: 'Bill',
  },
  currency: {
    templateId: '52b10289-99a0-4dfe-bb6b-6afca34e8501',
    name: 'Currency',
    type: 'Select',
  },
  description: {
    templateId: '70b02f35-f631-4da1-a506-6b8d4635e9b5',
    name: 'Description',
    type: 'Textarea',
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
  },
  issuedDate: {
    templateId: '6c2f58e8-2f6e-47cc-b109-904e74d1067b',
    name: 'Issued Date',
    type: 'Date',
  },
  item: {
    templateId: '9ffd1faf-b650-4a90-ad04-6153aad93c84',
    name: 'Item',
    type: 'Resource',
    resourceType: 'Item',
  },
  line: {
    templateId: '30fba00b-ca2f-48d1-a795-77e5843880ce',
    name: 'Line',
    type: 'Resource',
    resourceType: 'Line',
  },
  name: {
    templateId: 'aebb8b9f-d49a-4d5b-b6cf-453bfad847b4',
    name: 'Name',
    type: 'Text',
  },
  needDate: {
    templateId: 'f2a3f4a9-3d6e-4e3d-8f7b-4e0f7e1e7e5d',
    name: 'Need Date',
    type: 'Date',
  },
  number: {
    templateId: 'c056ca91-7f40-45d2-ae01-cd4bc66c09f2',
    name: 'Number',
    type: 'Text',
  },
  order: {
    templateId: '2f1954ab-e156-4d23-a3da-45e8168fcfdd',
    name: 'Order',
    type: 'Resource',
    resourceType: 'Order',
  },
  orderNotes: {
    templateId: 'a4d4eb67-b952-4a51-83d7-1c58c812de30',
    name: 'Order Notes',
    type: 'Textarea',
  },
  orderStatus: {
    templateId: 'd51e1004-c999-4ac1-8692-ff3d966c5dc3',
    name: 'Order Status',
    type: 'Select',
    options: [
      {
        templateId: '84c65f46-b8dd-43bf-9bbe-537b816fdeb5',
        name: 'Draft',
      },
      {
        templateId: '45b2ab63-6c20-4548-8427-027286d03759',
        name: 'Submitted',
      },
      {
        templateId: '9946f309-a3e4-4fdf-991a-cc9d3df80ec0',
        name: 'Approved',
      },
      {
        templateId: '37551c24-8610-4952-abcb-a9e54c086272',
        name: 'Ordered',
      },
      {
        templateId: 'f3f9b5a6-6b0e-4d4d-8d4e-2f7f3b1b7a3a',
        name: 'Received',
      },
      {
        templateId: 'e8b7c2c8-0b7b-4e9a-8e8d-7b2f5e1f6f4e',
        name: 'Canceled',
      },
    ],
  },
  paymentTerms: {
    templateId: '8a9c85a4-1aea-4c0c-9cd2-51c6943aaaf7',
    name: 'Payment Terms',
    type: 'Select',
  },
  poRecipient: {
    templateId: 'b735b67c-be50-4859-9242-00572b4d32cb',
    name: 'PO Recipient',
    type: 'Contact',
  },
  preferredPaymentType: {
    templateId: 'c0d7d3f0-0b5e-4b7f-8f1b-2b3d1f7c3f9f',
    name: 'Preferred Payment Type',
    type: 'Select',
  },
  primaryAddress: {
    templateId: '58e1e7ae-2dab-44e2-b741-e47eddd7a626',
    name: 'Primary Address',
    type: 'Textarea',
  },
  quantity: {
    templateId: '8c04f743-23a3-417f-8fd9-98cd5ffa4a67',
    name: 'Quantity',
    type: 'Number',
  },
  shippingAccountNumber: {
    templateId: 'e6f5b7c4-8f5e-4f2d-8d0f-3e8f2c4c4b5c',
    name: 'Shipping Account Number',
    type: 'Select',
  },
  shippingAddress: {
    templateId: '848fe67b-ee4f-4c68-bdaa-3089622337f6',
    name: 'Shipping Address',
    type: 'Textarea',
  },
  shippingMethod: {
    templateId: '01bcb707-bd68-4726-8220-65bd19eee224',
    name: 'Shipping Method',
    type: 'Select',
  },
  shippingNotes: {
    templateId: '0d5a6944-49e6-45bc-ac1e-5ed1c2ccc55c',
    name: 'Shipping Notes',
    type: 'Textarea',
  },
  subtotalCost: {
    templateId: '3234298a-d186-424e-a4b4-7678b4eec7d0',
    name: 'Subtotal Cost',
    type: 'Money',
  },
  taxable: {
    templateId: '8e61b78c-6e8c-4863-a7fd-af55fa66503f',
    name: 'Taxable',
    type: 'Checkbox',
  },
  termsAndConditions: {
    templateId: '156bdd18-42d2-427b-bcfe-97b7214c401e',
    name: 'Terms & Conditions',
    type: 'Textarea',
  },
  totalCost: {
    templateId: '507b8699-64af-4f8f-9319-b63c48827c61',
    name: 'Total Cost',
    type: 'Money',
  },
  unitOfMeasure: {
    templateId: 'a5c3e3a8-6a0b-4b6d-9b3a-7a5f1f3f3d2e',
    name: 'Unit of Measure',
    type: 'Select',
  },
  unitCost: {
    templateId: '099a0fe9-85a4-4860-b874-49e5191b7ac2',
    name: 'Unit Cost',
    type: 'Money',
  },
  vendor: {
    templateId: 'a5961273-842e-4a14-a37f-6dd7db020db0',
    name: 'Vendor',
    type: 'Resource',
    resourceType: 'Vendor',
  },
} as const satisfies Record<string, FieldTemplate>

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
    sections: [
      {
        name: 'Summary',
        fields: [
          fields.quantity,
          fields.unitCost,
          fields.needDate,
          fields.order,
          fields.bill,
          fields.item,
          fields.subtotalCost,
          fields.totalCost,
        ],
      },
    ],
  },
  {
    resourceType: 'Order',
    fields: [
      fields.orderStatus,
      fields.number,
      fields.vendor,
      fields.description,
      fields.assignee,
    ],
    sections: [
      {
        name: 'Order Info',
        fields: [fields.issuedDate, fields.document, fields.totalCost],
      },
      {
        name: 'Order Notes',
        fields: [fields.orderNotes],
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
    fields: [fields.name],
    sections: [
      {
        name: 'Summary',
        fields: [fields.description, fields.primaryAddress],
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
