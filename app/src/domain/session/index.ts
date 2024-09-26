import { injectable } from 'inversify'
import { mapSessionModelToEntity } from './mappers'
import { SessionCreationError } from './errors'
import { sessionIncludes } from './model'
import { Session } from './entity'
import { systemAccountId } from '@/lib/const'
import { isPrismaError } from '@/integrations/prisma-extensions'
import { PrismaService } from '@/integrations/PrismaService'

const SESSION_LIFESPAN_IN_DAYS = 7

const lifespanInSeconds = 1000 * 60 * 24 * SESSION_LIFESPAN_IN_DAYS

@injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(email: string, tat: string): Promise<Session> {
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
      include: sessionIncludes,
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

  async readAndExtendSession(sessionId: string): Promise<Session | null> {
    try {
      const session = await this.prisma.session.update({
        where: { id: sessionId, revokedAt: null },
        data: {
          expiresAt: new Date(Date.now() + lifespanInSeconds * 1000),
        },
        include: sessionIncludes,
      })

      return mapSessionModelToEntity(session)
    } catch (error) {
      if (isPrismaError('notFound')(error)) return null

      throw error
    }
  }

  async clearSession(sessionId: string) {
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
}
