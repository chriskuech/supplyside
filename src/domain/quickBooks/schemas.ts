import { z } from 'zod'

const metadataSchema = z.object({
  CreateTime: z.string(),
  LastUpdatedTime: z.string(),
})

const refSchema = z.object({
  name: z.string(),
  value: z.string(),
})

const addressSchema = z.object({
  City: z.string(),
  Country: z.string().optional(),
  Line1: z.string(),
  PostalCode: z.string(),
  CountrySubDivisionCode: z.string(),
  Id: z.string(),
})

const accountSchema = z.object({
  FullyQualifiedName: z.string(),
  domain: z.string(),
  Name: z.string(),
  Classification: z.string(),
  AccountSubType: z.string(),
  CurrencyRef: refSchema,
  CurrentBalanceWithSubAccounts: z.number(),
  sparse: z.boolean(),
  MetaData: metadataSchema,
  AccountType: z.string(),
  CurrentBalance: z.number(),
  Active: z.boolean(),
  SyncToken: z.string(),
  Id: z.string(),
  SubAccount: z.boolean(),
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
    Account: z.array(accountSchema),
  }),
})

export type AccountQuery = z.infer<typeof accountQuerySchema>

export const companyInfoSchema = z.object({
  CompanyInfo: z.object({
    SyncToken: z.string(),
    domain: z.string(),
    LegalAddr: addressSchema,
    SupportedLanguages: z.string(),
    CompanyName: z.string(),
    Country: z.string(),
    CompanyAddr: addressSchema,
    sparse: z.boolean(),
    Id: z.string(),
    FiscalYearStartMonth: z.string(),
    CustomerCommunicationAddr: addressSchema,
    PrimaryPhone: z.object({
      FreeFormNumber: z.string().optional(),
    }),
    LegalName: z.string(),
    CompanyStartDate: z.string(),
    Email: z.object({
      Address: z.string(),
    }),
    NameValue: z.array(z.object({ Name: z.string(), Value: z.string() })),
    MetaData: metadataSchema,
  }),
})

export type CompanyInfo = z.infer<typeof companyInfoSchema>
