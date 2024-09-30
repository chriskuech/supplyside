import fastify from 'fastify'
import {
  createJsonSchemaTransformObject,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { mountApi } from './api'
import fastifySwagger from '@fastify/swagger'
import { SessionSchema } from '@supplyside/api/domain/session/entity'
import { AccountSchema } from '@supplyside/api/domain/account/entity'
import { mountWebhooks } from './webhooks'
import { mountHealth } from './health'
import { JsonLogicSchema } from '../domain/resource/json-logic/types'
import { mountSelf } from './api/self'

export const createServer = (isDev?: boolean) => 
  fastify({
    logger: isDev ? {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    } : true,
  }) // TODO: reenable logging
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
    .register(mountHealth, { prefix: '/health' })
    .register(mountSelf, { prefix: '/self' })
    .register(mountWebhooks, { prefix: '/webhooks' })
    .setNotFoundHandler((request, reply) => reply.code(404).send('Not Found'))
