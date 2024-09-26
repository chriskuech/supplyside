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
  Amount: z.number(),
  Id: z.string(),
  AccountBasedExpenseLineDetail: z.object({
    TaxCodeRef: refSchema.optional(),
    AccountRef: refSchema,
    BillableStatus: z.string().optional(),
    CustomerRef: refSchema.optional(),
  }),
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

const emailSchema = z.object({
  Address: z.string(),
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

export const vendorQuerySchema = z.object({
  QueryResponse: z.object({
    startPosition: z.number(),
    Vendor: z.array(vendorSchema).optional(),
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

export const readAccountSchema = z.object({
  Account: accountSchema,
})

export const readVendorSchema = z.object({
  Vendor: vendorSchema,
})

export const readBillSchema = z.object({
  Bill: billSchema,
})

export const readBillPaymentSchema = z.object({
  BillPayment: billPaymentSchema,
})
