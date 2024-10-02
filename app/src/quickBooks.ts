import { config } from './config'

export const getBillUrl = (quickBooksBillId: string) =>
  `${config().QUICKBOOKS_BASE_URL}/app/bill?&txnId=${quickBooksBillId}`
