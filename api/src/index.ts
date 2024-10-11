import 'reflect-metadata'
import './instrument'

import { createServer as createRouter } from '@supplyside/api/router'
import { writeFileSync } from 'fs'
import openapiTS, { astToString } from 'openapi-typescript'
import process from 'process'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { ExtractedBillDataSchema } from './domain/bill/BillExtractionService'
import { ExtractedPurchaseDataSchema } from './domain/purchase/PurchaseExtractionService'

const isDev = process.env.SS_ENV === 'development'

;(async () => {
  const app = await createRouter(isDev)

  await app.ready()

  if (isDev || process.argv.includes('--gen')) {
    // gen OpenAPI types
    const json = JSON.stringify(app.swagger())
    const ast = await openapiTS(json)
    const ts = astToString(ast)
    writeFileSync('./client.ts', ts)

    // gen schema for data extraction
    const billJsonSchema = zodToJsonSchema(ExtractedBillDataSchema)
    writeFileSync('./bill.schema.json', JSON.stringify(billJsonSchema, null, 2))
    const purchaseJsonSchema = zodToJsonSchema(ExtractedPurchaseDataSchema)
    writeFileSync(
      './purchase.schema.json',
      JSON.stringify(purchaseJsonSchema, null, 2),
    )
  }

  if (process.argv.includes('--gen')) {
    process.exit(0)
  }

  app.listen({
    port: z.coerce.number().optional().parse(process.env.PORT),
    host: '0.0.0.0',
  })
})()
