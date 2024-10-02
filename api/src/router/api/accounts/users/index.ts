import { container } from '@supplyside/api/di'
import {
  UpdateUserSchema,
  UserService,
} from '@supplyside/api/domain/user/UserService'
import { UserSchema } from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountUsers = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'GET',
      url: '',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.array(UserSchema),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(UserService)

        const users = await service.list(req.params.accountId)

        res.send(users)
      },
    })
    .route({
      method: 'POST',
      url: '',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(UserService)

        await service.invite(req.params.accountId, req.body)

        res.send()
      },
    })
    .route({
      method: 'GET',
      url: '/:userId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          userId: z.string().uuid(),
        }),
        response: {
          200: UserSchema,
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(UserService)

        const user = await service.read(
          req.params.accountId,
          req.params.userId
        )

        res.send(user)
      },
    })
    .route({
      method: 'PATCH',
      url: '/:userId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          userId: z.string().uuid(),
        }),
        body: UpdateUserSchema,
      },
      handler: async (req, res) => {
        const service = container.resolve(UserService)

        await service.update(req.params.accountId, req.params.userId, req.body)

        res.send()
      },
    })
    .route({
      method: 'DELETE',
      url: '/:userId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          userId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(UserService)

        await service.delete(req.params.accountId, req.params.userId)

        res.send()
      },
    })
