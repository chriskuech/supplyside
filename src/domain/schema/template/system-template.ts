import { FieldTemplate, SchemaTemplate } from './types'

export const fields = {
  name: {
    templateId: 'aebb8b9f-d49a-4d5b-b6cf-453bfad847b4',
    name: 'Name',
    type: 'Text',
  },
  number: {
    templateId: 'c056ca91-7f40-45d2-ae01-cd4bc66c09f2',
    name: 'Number',
    type: 'Text',
  },
  description: {
    templateId: '70b02f35-f631-4da1-a506-6b8d4635e9b5',
    name: 'Description',
    type: 'RichText',
  },
  bill: {
    templateId: '50292f4a-f926-4d0f-a6e9-6b7a48f8b4c4',
    name: 'Bill',
    type: 'Resource',
    resourceType: 'Bill',
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
  order: {
    templateId: '2f1954ab-e156-4d23-a3da-45e8168fcfdd',
    name: 'Order',
    type: 'Resource',
    resourceType: 'Order',
  },
  quantity: {
    templateId: '8c04f743-23a3-417f-8fd9-98cd5ffa4a67',
    name: 'Quantity',
    type: 'Number',
  },
  unitPrice: {
    templateId: '099a0fe9-85a4-4860-b874-49e5191b7ac2',
    name: 'Unit Price',
    type: 'Money',
  },
  total: {
    templateId: '507b8699-64af-4f8f-9319-b63c48827c61',
    name: 'Total',
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
        name: 'Bill',
        fields: [fields.number, fields.vendor, fields.order],
      },
    ],
  },
  {
    resourceType: 'Item',
    sections: [
      {
        name: 'Item',
        fields: [fields.number, fields.name, fields.description],
      },
    ],
  },
  {
    resourceType: 'Line',
    sections: [
      {
        name: 'Line',
        fields: [fields.order, fields.item, fields.quantity, fields.bill],
      },
    ],
  },
  {
    resourceType: 'Order',
    sections: [
      {
        name: 'Order',
        fields: [fields.number, fields.vendor, fields.total],
      },
    ],
  },
  {
    resourceType: 'Vendor',
    sections: [
      {
        name: 'Vendor',
        fields: [fields.name, fields.description],
      },
    ],
  },
]
