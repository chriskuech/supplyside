import { ACCOUNT_BASED_EXPENSE } from '../constants'
import { mapValue } from './utils'
import { Resource } from '@/domain/resource/entity'
import { fields } from '@/domain/schema/template/system-fields'
import config from '@/services/config'

const fieldsMap = [
  {
    field: fields.quickBooksBillId,
    key: 'Id',
  },
  {
    field: fields.invoiceDate,
    key: 'TxnDate',
  },
  {
    field: fields.paymentDueDate,
    key: 'DueDate',
  },
  {
    field: fields.invoiceNumber,
    key: 'DocNumber',
  },
]

export const mapBill = (
  billResource: Resource,
  quickBooksAccountId: string,
  quickBooksVendorId: string,
) => {
  const quickBooksBill = fieldsMap.reduce(
    (bill, fieldMap) => ({
      ...bill,
      [fieldMap.key]: mapValue(billResource, fieldMap.field),
    }),
    {},
  )

  return {
    ...quickBooksBill,
    PrivateNote: `${config().BASE_URL}/bills/${billResource.key}`,
    VendorRef: {
      value: quickBooksVendorId,
    },
    Line: [
      {
        Description: mapValue(billResource, fields.billDescription),
        DetailType: ACCOUNT_BASED_EXPENSE,
        Amount: mapValue(billResource, fields.totalCost) ?? 0,
        AccountBasedExpenseLineDetail: {
          AccountRef: {
            value: quickBooksAccountId,
          },
        },
      },
    ],
  }
}
