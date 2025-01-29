import { container } from '@supplyside/api/di'
import {
  UpdateUserSchema,
  UserService,
} from '@supplyside/api/domain/user/UserService'
import { NotFoundError } from '@supplyside/api/integrations/fastify/NotFoundError'
import { UserSchema } from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountSelf = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'GET',
      url: '/:userId/',
      schema: {
        params: z.object({
          userId: z.string().uuid(),
        }),
        response: {
          200: UserSchema,
        },
      },
      handler: async (req) => {
        const service = container.resolve(UserService)

        const user = await service.readSelf(req.params.userId)

        if (!user) throw new NotFoundError('User not found')

        return user
      },
    })
    .route({
      method: 'PATCH',
      url: '/:userId/',
      schema: {
        params: z.object({
          userId: z.string().uuid(),
        }),
        body: UpdateUserSchema,
      },
      handler: async (req) => {
        const service = container.resolve(UserService)

        await service.updateSelf(req.params.userId, req.body)
      },
    })
