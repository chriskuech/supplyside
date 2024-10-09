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
import { DuplicateResourceError } from '../domain/resource/errors'
import { JsonLogicSchema } from '../domain/resource/json-logic/types'
import { SessionCreationError } from '../domain/session/errors'
import { IamUserNotFoundError } from '../domain/user/errors'
import { McMasterInvalidCredentials } from '../integrations/mcMasterCarr/errors'
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
    .setErrorHandler(function (error, request, reply) {
      if (error instanceof DuplicateResourceError) {
        reply.status(409).send({ message: error.message })
      } else if (error instanceof SessionCreationError) {
        reply.status(401).send({ message: error.message })
      } else if (error instanceof IamUserNotFoundError) {
        reply.status(401).send({ message: error.message })
      } else if (error instanceof McMasterInvalidCredentials) {
        reply.status(401).send({ message: error.message })
      } else {
        reply.send(error)
      }
    })
    .setNotFoundHandler((request, reply) => reply.code(404).send('Not Found'))

  Sentry.setupFastifyErrorHandler(app)

  return app
}
