import fastifySwagger from '@fastify/swagger'
import * as Sentry from '@sentry/node'
import { AccountSchema } from '@supplyside/api/domain/account/entity'
import { SessionSchema } from '@supplyside/api/domain/session/entity'
import fastify from 'fastify'
import {
  createJsonSchemaTransformObject,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { JsonLogicSchema } from '../domain/resource/json-logic/types'
import { mountApi } from './api'
import { mountSelf } from './api/self'
import { mountError } from './error'
import { mountHealth } from './health'
import { mountIntegrations } from './integrations'
import { mountWebhooks } from './webhooks'

export const createServer = async (isDev?: boolean) => {
  const app = fastify({
    logger: {
      level: isDev ? 'debug' : 'warn',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  })
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .register(fastifySwagger, {
      openapi: {
        info: {
          title: 'SupplySide API',
          version: '0.0.0',
        },
      },
      transform: jsonSchemaTransform,
      transformObject: createJsonSchemaTransformObject({
        schemas: {
          Account: AccountSchema,
          Session: SessionSchema,
          JsonLogic: JsonLogicSchema,
        },
      }),
    })
    .get('/', (request, reply) => reply.status(200).send('OK')) // required by App Service
    .register(mountApi, { prefix: '/api' })
    .register(mountError, { prefix: '/error' })
    .register(mountHealth, { prefix: '/health' })
    .register(mountSelf, { prefix: '/self' })
    .register(mountIntegrations, { prefix: '/integrations' })
    .register(mountWebhooks, { prefix: '/webhooks' })
    .setNotFoundHandler((request, reply) => reply.code(404).send('Not Found'))

  Sentry.setupFastifyErrorHandler(app)

  return app
}
