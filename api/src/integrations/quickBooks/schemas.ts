import { z } from 'zod'

const metadataSchema = z.object({
  CreateTime: z.string(),
  LastUpdatedTime: z.string(),
})

const refSchema = z.object({
  name: z.string().optional(),
  value: z.string(),
})

const addressSchema = z.object({
  City: z.string().optional(),
  Country: z.string().optional(),
  Line1: z.string().optional(),
  PostalCode: z.string().optional(),
  CountrySubDivisionCode: z.string().optional(),
  Id: z.string(),
})

const emailSchema = z.object({
  Address: z.string(),
})

const accountSchema = z.object({
  FullyQualifiedName: z.string(),
  domain: z.string(),
  Name: z.string(),
  Classification: z.string().optional(),
  AccountSubType: z.string().optional(),
  CurrencyRef: refSchema.optional(),
  CurrentBalanceWithSubAccounts: z.number(),
  sparse: z.boolean(),
  MetaData: metadataSchema.optional(),
  AccountType: z.string(),
  CurrentBalance: z.number(),
  Active: z.boolean().optional(),
  SyncToken: z.string(),
  Id: z.string(),
  SubAccount: z.boolean(),
})

const lineSchema = z.object({
  Description: z.string().optional(),
  DetailType: z.string(),
  ProjectRef: refSchema.optional(),
  Amount: z.number().optional(),
  Id: z.string().optional(),
  AccountBasedExpenseLineDetail: z
    .object({
      TaxCodeRef: refSchema.optional(),
      AccountRef: refSchema,
      BillableStatus: z.string().optional(),
      CustomerRef: refSchema.optional(),
    })
    .optional(),
  SalesItemLineDetail: z
    .object({
      ItemRef: refSchema,
      Qty: z.number().optional(),
      UnitPrice: z.number().optional(),
    })
    .optional(),
})

const itemSchema = z.object({
  Id: z.string(),
  Name: z.string(),
  QtyOnHand: z.number().optional(),
  IncomeAccountRef: refSchema.optional(),
  AssetAccountRef: refSchema.optional(),
  InvStartDate: z.string().optional(),
  Type: z.string(),
  ExpenseAccountRef: refSchema.optional(),
})

const billSchema = z.object({
  SyncToken: z.string(),
  domain: z.string(),
  APAccountRef: refSchema.optional(),
  VendorRef: refSchema.optional(),
  TxnDate: z.string().optional(),
  TotalAmt: z.number().optional(),
  CurrencyRef: refSchema.optional(),
  LinkedTxn: z
    .array(
      z.object({
        TxnId: z.string(),
        TxnType: z.string(),
      }),
    )
    .optional(),
  SalesTermRef: refSchema.optional(),
  DueDate: z.string().optional(),
  sparse: z.boolean(),
  Line: z.array(lineSchema).optional(),
  Balance: z.number(),
  Id: z.string(),
  MetaData: metadataSchema,
})

const invoiceSchema = z.object({
  domain: z.string(),
  PrintStatus: z.string().optional(),
  SalesTermRef: refSchema.optional(),
  TotalAmt: z.number().optional(),
  Line: z.array(lineSchema).optional(),
  DueDate: z.string().optional(),
  ApplyTaxAfterDiscount: z.boolean().optional(),
  DocNumber: z.string().optional(),
  sparse: z.boolean(),
  ProjectRef: refSchema.optional(),
  Deposit: z.number().optional(),
  Balance: z.number().optional(),
  CustomerRef: refSchema.optional(),
  TxnTaxDetail: z
    .object({
      TxnTaxCodeRef: refSchema.optional(),
      TotalTax: z.number().optional(),
      TaxLine: z.array(lineSchema).optional(),
    })
    .optional(),
  SyncToken: z.string(),
  LinkedTxn: z
    .array(
      z.object({
        TxnId: z.string(),
        TxnType: z.string(),
      }),
    )
    .optional(),
  BillEmail: emailSchema.optional(),
  ShipAddr: addressSchema.optional(),
  EmailStatus: z.string().optional(),
  BillAddr: addressSchema.optional(),
  CurrencyRef: refSchema.optional(),
  Id: z.string(),
  MetaData: metadataSchema,
})

const phoneSchema = z.object({
  FreeFormNumber: z.string().optional(),
})

const urlSchema = z.object({
  URI: z.string(),
})

export const countQuerySchema = z.object({
  QueryResponse: z.object({
    totalCount: z.number(),
  }),
})

export const quickbooksTokenSchema = z.object({
  latency: z.number(),
  access_token: z.string(),
  createdAt: z.number(),
  expires_in: z.number(),
  id_token: z.string(),
  realmId: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  x_refresh_token_expires_in: z.number(),
})

export type QuickBooksToken = z.infer<typeof quickbooksTokenSchema>

export const accountQuerySchema = z.object({
  QueryResponse: z.object({
    Account: z.array(accountSchema).optional(),
  }),
})

export const companyInfoSchema = z.object({
  CompanyInfo: z.object({
    SyncToken: z.string(),
    domain: z.string(),
    LegalAddr: addressSchema.optional(),
    SupportedLanguages: z.string().optional(),
    CompanyName: z.string(),
    Country: z.string().optional(),
    CompanyAddr: addressSchema,
    sparse: z.boolean(),
    Id: z.string(),
    FiscalYearStartMonth: z.string().optional(),
    CustomerCommunicationAddr: addressSchema.optional(),
    PrimaryPhone: phoneSchema.optional(),
    LegalName: z.string().optional(),
    CompanyStartDate: z.string(),
    Email: emailSchema.optional(),
    NameValue: z
      .array(z.object({ Name: z.string(), Value: z.string() }))
      .optional(),
    MetaData: metadataSchema.optional(),
  }),
})

export const vendorSchema = z.object({
  PrimaryEmailAddr: emailSchema.optional(),
  Vendor1099: z.boolean().optional(),
  domain: z.string(),
  GivenName: z.string().optional(),
  DisplayName: z.string(),
  BillAddr: addressSchema.optional(),
  SyncToken: z.string(),
  PrintOnCheckName: z.string().optional(),
  FamilyName: z.string().optional(),
  PrimaryPhone: phoneSchema.optional(),
  AcctNum: z.string().optional(),
  CompanyName: z.string().optional(),
  WebAddr: urlSchema.optional(),
  sparse: z.boolean(),
  Active: z.boolean().optional(),
  Balance: z.number(),
  Id: z.string(),
  MetaData: metadataSchema.optional(),
})

export const customerSchema = z.object({
  PrimaryEmailAddr: emailSchema.optional(),
  domain: z.string(),
  GivenName: z.string().optional(),
  DisplayName: z.string(),
  FullyQualifiedName: z.string().optional(),
  BillAddr: addressSchema.optional(),
  BillWithParent: z.boolean().optional(),
  SyncToken: z.string(),
  PrintOnCheckName: z.string().optional(),
  FamilyName: z.string().optional(),
  PrimaryPhone: phoneSchema.optional(),
  CompanyName: z.string().optional(),
  sparse: z.boolean(),
  Active: z.boolean().optional(),
  Balance: z.number(),
  Id: z.string(),
  MetaData: metadataSchema.optional(),
  Job: z.boolean().optional(),
  BalanceWithJobs: z.number().optional(),
  PreferredDeliveryMethod: z.string().optional(),
  Taxable: z.boolean().optional(),
  ParentRef: refSchema.optional(),
})

export const vendorQuerySchema = z.object({
  QueryResponse: z.object({
    startPosition: z.number(),
    Vendor: z.array(vendorSchema).optional(),
    maxResults: z.number(),
  }),
})

export const customerQuerySchema = z.object({
  QueryResponse: z.object({
    startPosition: z.number(),
    Customer: z.array(customerSchema).optional(),
    maxResults: z.number(),
  }),
})

export const billPaymentSchema = z.object({
  VendorRef: refSchema,
  PayType: z.string(),
  CreditCardPayment: z
    .object({
      CCAccountRef: refSchema.optional(),
    })
    .optional(),
  TotalAmt: z.number(),
  domain: z.string(),
  sparse: z.boolean(),
  Id: z.string(),
  SyncToken: z.string(),
  MetaData: metadataSchema,
  DocNumber: z.string().optional(),
  TxnDate: z.string().optional(),
  CurrencyRef: refSchema.optional(),
  PrivateNote: z.string().optional(),
  Line: z.array(
    z.object({
      Amount: z.number(),
      LinkedTxn: z.array(
        z.object({
          TxnId: z.string(),
          TxnType: z.string(),
        }),
      ),
    }),
  ),
})

export const PaymentSchema = z.object({
  SyncToken: z.string(),
  domain: z.string(),
  DepositToAccountRef: refSchema.optional(),
  UnappliedAmt: z.number(),
  TxnDate: z.string().optional(),
  TotalAmt: z.number(),
  ProjectRef: refSchema.optional(),
  ProcessPayment: z.boolean().optional(),
  sparse: z.boolean(),
  Line: z.array(
    z.object({
      Amount: z.number(),
      LinkedTxn: z.array(
        z.object({
          TxnId: z.string(),
          TxnType: z.string(),
        }),
      ),
    }),
  ),
  CustomerRef: refSchema.optional(),
  Id: z.string(),
})

export const readAccountSchema = z.object({
  Account: accountSchema,
})

export const readVendorSchema = z.object({
  Vendor: vendorSchema,
})

export const readCustomerSchema = z.object({
  Customer: customerSchema,
})

export const readBillSchema = z.object({
  Bill: billSchema,
})

export const readInvoiceSchema = z.object({
  Invoice: invoiceSchema,
})

export const readBillPaymentSchema = z.object({
  BillPayment: billPaymentSchema,
})

export const readPaymentSchema = z.object({
  Payment: PaymentSchema,
})

export const webhookEntitiesNameSchema = z.enum(['BillPayment', 'Payment'])

export const webhookEntitiySchema = z.object({
  id: z.string(),
  operation: z.enum(['Create', 'Update', 'Merge', 'Delete', 'Void']),
  name: webhookEntitiesNameSchema,
  lastUpdated: z.string(),
})

export const webhookBodySchema = z.object({
  eventNotifications: z.array(
    z.object({
      realmId: z.string(),
      dataChangeEvent: z.object({
        entities: z.array(webhookEntitiySchema),
      }),
    }),
  ),
})

export const readItemSchema = z.object({
  Item: itemSchema,
})

export const queryItemSchema = z.object({
  QueryResponse: z.object({
    Item: z.array(itemSchema).optional(),
  }),
})
