'use server'

import { faker } from '@faker-js/faker'
import { hash } from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { User, mapUserModel, userInclude } from './types'
import smtp from '@/services/smtp'
import config from '@/services/config'
import prisma from '@/services/prisma'

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
  const password = faker.string.nanoid()

  await prisma().user.create({
    data: {
      email,
      accountId,
      passwordHash: await hash(password, 12),
      requirePasswordReset: true,
      isAdmin,
    },
  })

  await smtp().sendEmailWithTemplate({
    From: 'SupplySide <bot@supplyside.io>',
    To: email,
    TemplateAlias: 'user-invitation',
    TemplateModel: {
      invite_email: email,
      invite_password: password,
      action_url: `${config().BASE_URL}${loginPath}`,
      product_url: config().BASE_URL,
    },
    MessageStream: 'outbound',
  })

  revalidatePath('')
}

type ReadUserParams = {
  userId: string
}

export async function readUser({ userId }: ReadUserParams): Promise<User> {
  revalidatePath('')

  const user = await prisma().user.findUniqueOrThrow({
    where: { id: userId },
    include: userInclude,
  })

  return mapUserModel(user)
}

type ReadUsersParams = { accountId: string }

export async function readUsers({
  accountId,
}: ReadUsersParams): Promise<User[]> {
  revalidatePath('')

  const users = await prisma().user.findMany({
    where: {
      accountId,
    },
    include: {
      ImageBlob: true,
    },
  })

  return users.map(mapUserModel)
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

  revalidatePath('')
}
