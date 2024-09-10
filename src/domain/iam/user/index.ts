import { v4 as uuid } from 'uuid'
import { userInclude } from './model'
import { mapUserModelToEntity } from './mappers'
import { User } from './entity'
import prisma from '@/services/prisma'
import config from '@/services/config'
import smtp from '@/services/smtp'

const loginPath = '/auth/login'

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
  await prisma().user.create({
    data: {
      email,
      accountId,
      isAdmin,
    },
  })

  await smtp().sendEmailWithTemplate({
    From: 'SupplySide <bot@supplyside.io>',
    To: email,
    TemplateAlias: 'user-invitation',
    TemplateModel: {
      invite_email: email,
      action_url: `${config().BASE_URL}${loginPath}`,
      product_url: config().BASE_URL,
    },
    MessageStream: 'outbound',
  })
}

type VerifyEmailParams = {
  email: string
}

export async function verifyEmail({ email }: VerifyEmailParams): Promise<void> {
  const tokenLifespanInMinutes = 5

  const tat = uuid()
  const tatExpiresAt = new Date(Date.now() + 1000 * 60 * tokenLifespanInMinutes)

  await prisma().user.update({
    where: { email },
    data: { tat, tatExpiresAt },
  })

  await smtp().sendEmailWithTemplate({
    From: 'SupplySide <bot@supplyside.io>',
    To: email,
    TemplateAlias: 'email-verification',
    TemplateModel: {
      verify_email: email,
      verify_token: tat,
      action_url: `${config().BASE_URL}${loginPath}?email=${email}&token=${tat}`,
      product_url: config().BASE_URL,
    },
    MessageStream: 'outbound',
  })
}

type ReadUserParams = {
  userId: string
}

export async function readUser({ userId }: ReadUserParams): Promise<User> {
  const user = await prisma().user.findUniqueOrThrow({
    where: { id: userId },
    include: userInclude,
  })

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
