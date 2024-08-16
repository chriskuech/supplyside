'use server'

import { faker } from '@faker-js/faker'
import { hash } from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { Blob, Prisma, User as UserCoreModel } from '@prisma/client'
import { getDownloadPath } from '../blobs/utils'
import smtp from '@/lib/smtp'
import config from '@/lib/config'
import prisma from '@/lib/prisma'
import { systemAccountId } from '@/lib/const'

export const userInclude = {
  ImageBlob: true,
} satisfies Prisma.UserInclude

export type User = {
  id: string
  accountId: string
  firstName: string | null
  lastName: string | null
  fullName: string
  email: string
  profilePicPath: string | null
  requirePasswordReset: boolean
  tsAndCsSignedAt: Date | null
  isApprover: boolean
  isAdmin: boolean
  isGlobalAdmin: boolean
}

export type UserModel = UserCoreModel & {
  ImageBlob: Blob | null
}

export const mapUserModel = (model: UserModel): User => ({
  id: model.id,
  accountId: model.accountId,
  firstName: model.firstName,
  lastName: model.lastName,
  fullName: `${model.firstName} ${model.lastName}`,
  email: model.email,
  profilePicPath:
    model.ImageBlob &&
    getDownloadPath({
      blobId: model.ImageBlob.id,
      mimeType: model.ImageBlob.mimeType,
      fileName: 'profile-pic',
    }),
  requirePasswordReset: model.requirePasswordReset,
  tsAndCsSignedAt: model.tsAndCsSignedAt,
  isAdmin: model.isAdmin,
  isApprover: model.isApprover,
  isGlobalAdmin: model.accountId === systemAccountId,
})

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
