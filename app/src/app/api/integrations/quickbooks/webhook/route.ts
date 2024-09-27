import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { groupBy } from 'remeda'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import {
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import { container } from '@/lib/di'
import { QuickBooksService } from '@/integrations/quickBooks/QuickBooksService'
import { ResourceService } from '@/domain/resource/ResourceService'
import { SchemaService } from '@/domain/schema/SchemaService'
import ConfigService from '@/integrations/ConfigService'

const bodySchema = z.object({
  eventNotifications: z.array(
    z.object({
      realmId: z.string(),
      dataChangeEvent: z.object({
        entities: z.array(
          z.object({
            id: z.string(),
            operation: z.enum(['Create', 'Update', 'Merge', 'Delete', 'Void']),
            name: z.enum(['BillPayment']),
            lastUpdated: z.string(),
          }),
        ),
      }),
    }),
  ),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const signature = request.headers.get('intuit-signature')
  const quickBooksService = container().resolve(QuickBooksService)
  const resourceService = container().resolve(ResourceService)
  const schemaService = container().resolve(SchemaService)
  const configService = container().resolve(ConfigService)
  const verifierToken = configService.config.QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN

  if (!signature || !verifierToken)
    return NextResponse.json(null, { status: 401 })
  if (!body) return NextResponse.json(null, { status: 200 })

  const hash = createHmac('sha256', verifierToken)
    .update(JSON.stringify(body))
    .digest('base64')

  if (hash !== signature) return NextResponse.json(null, { status: 401 })

  const data = bodySchema.parse(body)

  //TODO: we should add events to a queue and process somewhere else
  await Promise.all(
    data.eventNotifications.map(async (notification) => {
      const accountId = await quickBooksService.findAccountIdByRealmId(
        notification.realmId,
      )
      if (!accountId) return

      const entities = groupBy(
        notification.dataChangeEvent.entities,
        (entity) => entity.id,
      )

      return Promise.all(
        Object.keys(entities).map(async (entityId) => {
          // Right now the only entities supported are bill payments (change bodySchema to accept more entities)
          const billPayment = await quickBooksService.getBillPayment(
            accountId,
            entityId,
          )
          const billIds = billPayment.BillPayment.Line.flatMap((line) =>
            line.LinkedTxn.filter((txn) => txn.TxnType === 'Bill').map(
              (txn) => txn.TxnId,
            ),
          )

          return Promise.all(
            billIds.map(async (billId) => {
              const bill = await resourceService.findResourceByUniqueValue(
                accountId,
                'Bill',
                fields.quickBooksBillId,
                { string: billId },
              )

              if (!bill) return

              const quickBooksBill = await quickBooksService.getBill(
                accountId,
                billId,
              )

              //TODO: we are missing updating the previously related bills status when a billPayment is deleted or updated
              if (quickBooksBill.Bill.Balance === 0) {
                const billSchema = await schemaService.readSchema(
                  accountId,
                  'Bill',
                )

                const billStatusFieldId = selectSchemaFieldUnsafe(
                  billSchema,
                  fields.billStatus,
                ).id

                const paidOptionId = selectSchemaFieldOptionUnsafe(
                  billSchema,
                  fields.billStatus,
                  billStatusOptions.paid,
                ).id

                await resourceService.updateResourceField({
                  accountId,
                  resourceId: bill.id,
                  fieldId: billStatusFieldId,
                  value: { optionId: paidOptionId },
                })
              }
            }),
          )
        }),
      )
    }),
  )

  return NextResponse.json(null, { status: 200 })
}
