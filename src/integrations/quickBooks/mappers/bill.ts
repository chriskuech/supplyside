import { singleton } from 'tsyringe'
import { ACCOUNT_BASED_EXPENSE } from '../constants'
import { mapValue } from './utils'
import { Resource } from '@/domain/resource/entity'
import { fields } from '@/domain/schema/template/system-fields'
import ConfigService from '@/integrations/ConfigService'

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

@singleton()
export class QuickBooksBillService {
  constructor(private readonly configService: ConfigService) {}

  mapBill(
    billResource: Resource,
    quickBooksAccountId: string,
    quickBooksVendorId: string,
  ) {
    const quickBooksBill = fieldsMap.reduce(
      (bill, fieldMap) => ({
        ...bill,
        [fieldMap.key]: mapValue(billResource, fieldMap.field),
      }),
      {},
    )

    return {
      ...quickBooksBill,
      PrivateNote: `${this.configService.config.BASE_URL}/bills/${billResource.key}`,
      VendorRef: {
        value: quickBooksVendorId,
      },
      Line: [
        {
          Description: mapValue(billResource, fields.purchaseDescription),
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
}
