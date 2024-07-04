'use server'

import { faker } from '@faker-js/faker'
import { hash } from 'bcrypt'
import { revalidateTag } from 'next/cache'
import { getDownloadPath } from '../blobs/utils'
import { User } from './types'
import smtp from '@/lib/smtp'
import config from '@/lib/config'
import prisma from '@/lib/prisma'

const loginPath = '/auth/login'

export async function inviteUser(
  accountId: string,
  email: string,
): Promise<void> {
  const password = faker.string.nanoid()

  await prisma().user.create({
    data: {
      email,
      accountId,
      passwordHash: await hash(password, config().SALT),
      requirePasswordReset: true,
    },
  })

  await smtp().sendEmail({
    From: 'bot@supplyside.io',
    To: email,
    Subject: 'Hello from SupplySide',
    HtmlBody: renderInviteTemplate({ email, password }),
    MessageStream: 'outbound',
  })

  revalidateTag('iam')
}

type ReadUserParams = {
  userId: string
}

export async function readUser({ userId }: ReadUserParams): Promise<User> {
  revalidateTag('iam')

  const user = await prisma().user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      ImageBlob: true,
    },
  })

  const profilePicPath =
    user.ImageBlob &&
    getDownloadPath({
      blobId: user.ImageBlob.id,
      mimeType: user.ImageBlob.mimeType,
      fileName: 'profile-pic',
    })

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    profilePicPath,
  }
}

type ReadUsersParams = { accountId: string }

export async function readUsers({
  accountId,
}: ReadUsersParams): Promise<User[]> {
  revalidateTag('iam')

  const users = await prisma().user.findMany({
    where: {
      accountId,
    },
    include: {
      ImageBlob: true,
    },
  })

  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    profilePicPath:
      user.ImageBlob &&
      getDownloadPath({
        blobId: user.ImageBlob.id,
        mimeType: user.ImageBlob.mimeType,
        fileName: 'profile-pic',
      }),
  }))
}

const renderInviteTemplate = (d: { email: string; password: string }) => `
  <h3>Welcome to SupplySide!<h3>

  <p>Use the temporary email and password below to log into <a href="${config().BASE_URL}${loginPath}">${config().BASE_URL}${loginPath}</a>.</p>

  <h5>Credentials</h5>
  <table>
    <tr>
      <th>Email</th>
      <td>${d.email}</td>
    </tr>
    <tr>
      <th>Password</th>
      <td><code>${d.password}</code></td>
    </tr>
  </table>
`

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

  revalidateTag('iam')
}
