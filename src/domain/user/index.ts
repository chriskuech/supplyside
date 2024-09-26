import { v4 as uuid } from 'uuid'
import { injectable } from 'inversify'
import { User } from './entity'
import { mapUserModelToEntity } from './mappers'
import { userInclude } from './model'
import { IamUserNotFoundError } from './errors'
import { PrismaService } from '@/integrations/PrismaService'
import ConfigService from '@/integrations/ConfigService'
import SmtpService from '@/integrations/SmtpService'
import { isPrismaError } from '@/integrations/prisma-extensions'

const loginPath = '/auth/login'
const verifyLoginPath = '/auth/verify-login'

export type UpdateUserInput = {
  email?: string
  firstName?: string
  lastName?: string
  imageBlobId?: string
  tsAndCsSignedAt?: Date
  isAdmin?: boolean
  isApprover?: boolean
}

export type InviteUserInput = {
  email: string
  isAdmin?: boolean
}

export type StartEmailVerificationInput = {
  email: string
  returnTo?: string
}

@injectable()
export class UserService {
  constructor(
    private readonly smtpService: SmtpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get config() {
    return this.configService.config
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

    await this.smtpService.sendEmailWithTemplate({
      From: 'SupplySide <bot@supplyside.io>',
      To: email,
      TemplateAlias: 'user-invitation',
      TemplateModel: {
        invite_email: email,
        action_url: `${this.configService.config.BASE_URL}${loginPath}`,
        product_url: this.configService.config.BASE_URL,
      },
      MessageStream: 'outbound',
    })
  }

  async startEmailVerification({
    email,
    returnTo,
  }: StartEmailVerificationInput): Promise<void> {
    const tokenLifespanInMinutes = 5

    const tat = uuid()
    const tatExpiresAt = new Date(
      Date.now() + 1000 * 60 * tokenLifespanInMinutes,
    )

    try {
      await this.prisma.user.update({
        where: { email },
        data: { tat, tatExpiresAt },
      })
    } catch (error) {
      if (isPrismaError('notFound')(error)) {
        throw new IamUserNotFoundError()
      }

      throw error
    }

    await this.smtpService.sendEmailWithTemplate({
      From: 'SupplySide <bot@supplyside.io>',
      To: email,
      TemplateAlias: 'email-verification',
      TemplateModel: {
        verify_email: email,
        verify_token: tat,
        action_url:
          `${this.config.BASE_URL}${verifyLoginPath}?email=${encodeURIComponent(email)}&token=${tat}` +
          (returnTo ? `&returnTo=${returnTo}` : ''),
        product_url: this.config.BASE_URL,
      },
      MessageStream: 'outbound',
    })
  }
}
