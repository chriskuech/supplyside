import { ConfigService } from '@supplyside/api/ConfigService'
import { systemAccountId } from '@supplyside/api/const'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import SmtpService from '@supplyside/api/integrations/SmtpService'
import { isPrismaError } from '@supplyside/api/integrations/prisma-extensions'
import { inject, injectable } from 'inversify'
import { v4 as uuid } from 'uuid'
import { IamUserNotFoundError } from '../user/errors'
import { Session } from './entity'
import { SessionCreationError } from './errors'
import { mapSessionModelToEntity } from './mappers'

const SESSION_LIFESPAN_IN_DAYS = 7
const verifyLoginPath = '/auth/verify-login'
const lifespanInSeconds = 1000 * 60 * 24 * SESSION_LIFESPAN_IN_DAYS

export type StartEmailVerificationInput = {
  email: string
  returnTo?: string
}

@injectable()
export class SessionService {
  constructor(
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(SmtpService) private readonly smtpService: SmtpService,
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async create(email: string, tat: string): Promise<Session> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new SessionCreationError('No user found with that email.')
    }

    if (!tat) {
      throw new SessionCreationError(
        'No token provided. Please retry with a valid token.',
      )
    }

    if (!user.tatExpiresAt || user.tat !== tat) {
      throw new SessionCreationError(
        'The token provided is incorrect. Please retry with the correct token.',
      )
    }

    if (user.tatExpiresAt < new Date()) {
      throw new SessionCreationError(
        'The token provided has expired. Please retry with a new token.',
      )
    }

    const expiresAt = new Date(Date.now() + lifespanInSeconds * 1000)

    const session = await this.prisma.session.create({
      data: {
        expiresAt,
        Account: { connect: { id: user.accountId } },
        User: { connect: { id: user.id } },
      },
    })

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        tat: null,
        tatExpiresAt: null,
      },
    })

    return mapSessionModelToEntity(session)
  }

  async read(sessionId: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId, revokedAt: null },
    })

    if (!session) return null

    return mapSessionModelToEntity(session)
  }

  async extend(sessionId: string): Promise<Session | null> {
    try {
      const session = await this.prisma.session.update({
        where: { id: sessionId, revokedAt: null },
        data: {
          expiresAt: new Date(Date.now() + lifespanInSeconds * 1000),
        },
      })

      return mapSessionModelToEntity(session)
    } catch (error) {
      if (isPrismaError('notFound')(error)) return null

      throw error
    }
  }

  async clear(sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    })
  }

  async impersonate(sessionId: string, accountId: string) {
    await this.prisma.session.update({
      where: {
        id: sessionId,
        User: {
          accountId: systemAccountId,
        },
      },
      data: { accountId },
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

    await this.smtpService.sendEmail({
      to: [{ email }],
      templateAlias: 'email-verification',
      templateModel: {
        verify_email: email,
        verify_token: tat,
        action_url:
          `${
            this.configService.config.APP_BASE_URL
          }${verifyLoginPath}?email=${encodeURIComponent(email)}&token=${tat}` +
          (returnTo ? `&returnTo=${returnTo}` : ''),
        product_url: this.configService.config.APP_BASE_URL,
      },
    })
  }
}
