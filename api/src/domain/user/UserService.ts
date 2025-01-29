import { ConfigService } from '@supplyside/api/ConfigService'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import SmtpService from '@supplyside/api/integrations/SmtpService'
import { User } from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { mapUserModelToEntity } from './mappers'
import { userInclude } from './model'

const loginPath = '/auth/login'

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  imageBlobId: z.string().uuid().optional(),
  tsAndCsSignedAt: z.string().datetime().optional(),
  isAdmin: z.boolean().optional(),
  isApprover: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export type InviteUserInput = {
  email: string
  isAdmin?: boolean
}

@injectable()
export class UserService {
  constructor(
    @inject(SmtpService)
    private readonly smtpService: SmtpService,
    @inject(PrismaService)
    private readonly prisma: PrismaService,
    @inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async readSelf(userId: string): Promise<User> {
    const model = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: userInclude,
    })

    return mapUserModelToEntity(model)
  }

  async read(accountId: string, userId: string): Promise<User> {
    const model = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
        accountId,
      },
      include: userInclude,
    })

    return mapUserModelToEntity(model)
  }

  async list(accountId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { accountId },
      include: userInclude,
    })

    return users.map(mapUserModelToEntity)
  }

  async update(accountId: string, userId: string, data: UpdateUserInput) {
    await this.prisma.user.update({
      where: { accountId, id: userId },
      data,
    })
  }

  async updateSelf(userId: string, data: UpdateUserInput) {
    await this.prisma.user.update({
      where: { id: userId },
      data,
    })
  }

  async delete(accountId: string, userId: string) {
    await this.prisma.user.delete({
      where: {
        accountId,
        id: userId,
      },
    })
  }

  async invite(accountId: string, { email, isAdmin }: InviteUserInput) {
    await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        accountId,
        isAdmin,
      },
    })

    await this.smtpService.sendEmail({
      to: [{ email }],
      subject: 'You have been invited to SupplySide',
      textBody: `You have been invited to SupplySide. Click the link below to login: ${this.configService.config.APP_BASE_URL}${loginPath}`,
      // templateAlias: 'user-invitation',
      // templateModel: {
      //   invite_email: email,
      //   action_url: `${this.configService.config.APP_BASE_URL}${loginPath}`,
      //   product_url: this.configService.config.APP_BASE_URL,
      // },
    })
  }
}
