import 'reflect-metadata'
import './instrument'

import { createServer as createRouter } from '@supplyside/api/router'
import { writeFileSync } from 'fs'
import openapiTS, { astToString } from 'openapi-typescript'
import process from 'process'
import { z } from 'zod'

const isDev = process.env.SS_ENV === 'development'

;(async () => {
  const app = await createRouter(isDev)

  await app.ready()

  if (isDev || process.argv.includes('--gen')) {
    const json = JSON.stringify(app.swagger())
    const ast = await openapiTS(json)
    const ts = astToString(ast)
    writeFileSync('./client.ts', ts)
  }

  if (process.argv.includes('--gen')) {
    process.exit(0)
  }

  app.listen({
    port: z.coerce.number().optional().parse(process.env.PORT),
    host: '0.0.0.0',
  })
})()
