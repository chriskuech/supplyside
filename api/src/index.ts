import 'reflect-metadata'
import process from 'process'
import { createServer as createRouter } from '@supplyside/api/router'
import { writeFileSync } from 'fs'
import openapiTS, { astToString } from 'openapi-typescript'
import { container } from './di'
import { ConfigService } from './ConfigService';

(async () => {
  const { config } = container.resolve(ConfigService)

  const app = createRouter(config.NODE_ENV)

  process.on('exit', () => app.close())

  await app.ready()

  if (config.CI || config.NODE_ENV === 'development') {
    const json = JSON.stringify(app.swagger())
    const ast = await openapiTS(json)
    const ts = astToString(ast)
    writeFileSync('./client.ts', ts)
  }

  if (process.argv.includes('--gen')) {
    process.exit(0)
  }

  app.listen({ port: config.PORT, host: '0.0.0.0' })
})()
