import { config } from '@/config'

export const getBillUrl = (quickBooksBillId: string) =>
  `${config().QUICKBOOKS_BASE_URL}/app/bill?&txnId=${quickBooksBillId}`

export const getVendorUrl = (quickBooksVendorId: string) =>
  `${config().QUICKBOOKS_BASE_URL}/app/vendordetail?nameId=${quickBooksVendorId}`

export const getCustomerUrl = (quickBooksCustomerId: string) =>
  `${config().QUICKBOOKS_BASE_URL}/app/customerdetail?nameId=${quickBooksCustomerId}`

export const getInvoiceUrl = (quickBooksInvoiceId: string) =>
  `${config().QUICKBOOKS_BASE_URL}/app/invoice?txnId=${quickBooksInvoiceId}`
