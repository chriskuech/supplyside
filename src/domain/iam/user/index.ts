import { v4 as uuid } from 'uuid'
import { container } from 'tsyringe'
import { userInclude } from './model'
import { mapUserModelToEntity } from './mappers'
import { User } from './entity'
import { IamUserNotFoundError } from './errors'
import prisma from '@/integrations/prisma'
import { isPrismaError } from '@/integrations/prisma-extensions'
import SmtpService from '@/integrations/SmtpService'
import ConfigService from '@/integrations/ConfigService'

const loginPath = '/auth/login'
const verifyLoginPath = '/auth/verify-login'

type InviteUserParams = {
  accountId: string
  email: string
  isAdmin?: boolean
}

export async function inviteUser({
  accountId,
  email,
  isAdmin,
}: InviteUserParams): Promise<void> {
  const smtpService = container.resolve(SmtpService)
  const { config } = container.resolve(ConfigService)

  await prisma().user.create({
    data: {
      email: email.toLowerCase(),
      accountId,
      isAdmin,
    },
  })

  await smtpService.sendEmailWithTemplate({
    From: 'SupplySide <bot@supplyside.io>',
    To: email,
    TemplateAlias: 'user-invitation',
    TemplateModel: {
      invite_email: email,
      action_url: `${config.BASE_URL}${loginPath}`,
      product_url: config.BASE_URL,
    },
    MessageStream: 'outbound',
  })
}

export type StartEmailVerificationParams = {
  email: string
  returnTo?: string
}

export async function startEmailVerification({
  email,
  returnTo,
}: StartEmailVerificationParams): Promise<void> {
  const tokenLifespanInMinutes = 5

  const smtpService = container.resolve(SmtpService)
  const { config } = container.resolve(ConfigService)

  const tat = uuid()
  const tatExpiresAt = new Date(Date.now() + 1000 * 60 * tokenLifespanInMinutes)

  try {
    await prisma().user.update({
      where: { email },
      data: { tat, tatExpiresAt },
    })
  } catch (error) {
    if (isPrismaError('notFound')(error)) {
      throw new IamUserNotFoundError()
    }

    throw error
  }

  await smtpService.sendEmailWithTemplate({
    From: 'SupplySide <bot@supplyside.io>',
    To: email,
    TemplateAlias: 'email-verification',
    TemplateModel: {
      verify_email: email,
      verify_token: tat,
      action_url:
        `${config.BASE_URL}${verifyLoginPath}?email=${encodeURIComponent(email)}&token=${tat}` +
        (returnTo ? `&returnTo=${returnTo}` : ''),
      product_url: config.BASE_URL,
    },
    MessageStream: 'outbound',
  })
}

type ReadUserParams = {
  userId: string
}

export async function readUser({ userId }: ReadUserParams): Promise<User> {
  const user = await prisma().user.findUnique({
    where: { id: userId },
    include: userInclude,
  })

  if (!user) {
    throw new IamUserNotFoundError()
  }

  return mapUserModelToEntity(user)
}

type ReadUsersParams = { accountId: string }

export async function readUsers({
  accountId,
}: ReadUsersParams): Promise<User[]> {
  const users = await prisma().user.findMany({
    where: {
      accountId,
    },
    include: {
      ImageBlob: true,
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return users.map(mapUserModelToEntity)
}

type DeleteUserParams = { accountId: string; userId: string }

export async function deleteUser({
  userId,
  accountId,
}: DeleteUserParams): Promise<void> {
  await prisma().user.delete({
    where: {
      accountId,
      id: userId,
    },
  })
}
