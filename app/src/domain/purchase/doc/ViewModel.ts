export type PurchaseViewModel = {
  vendorName: string | null
  accountName: string | null
  accountAddress: string | null
  termsAndConditions: string | null
  notes: string | null
  currency: string | null
  paymentTerms: string | null
  number: string | null
  subtotal: string | null
  total: string | null
  taxable: string | null
  costs: KeyValueModel[]
  shippingAddress: AddressViewModel
  shippingMethod: string | null
  incoterms: string | null
  shippingAccountNumber: string | null
  shippingNotes: string | null
  lines: LineViewModel[]
  issuedDate: string | null
  logoBlobDataUrl: string | null
  poRecipientName: string | null
  vendorPrimaryAddress: AddressViewModel
}

export type KeyValueModel = {
  key: string
  value: string
}

export type LineViewModel = {
  itemName: string | null
  itemDescription: string | null
  unitOfMeasure: string | null
  quantity: string | null
  unitCost: string | null
  totalCost: string | null
  additionalFields: KeyValueModel[]
}

export type AddressViewModel = {
  line1: string | null
  line2: string | null
  line3: string | null
}
