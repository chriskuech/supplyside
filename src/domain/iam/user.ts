'use server'

import { faker } from '@faker-js/faker'
import { hash } from 'bcrypt'
import { revalidateTag } from 'next/cache'
import { ServerClient } from 'postmark'
import { getDownloadPath } from '../blobs/utils'
import { User } from './types'
import config from '@/lib/config'
import prisma from '@/lib/prisma'
import { readSession, requireSession } from '@/lib/session'

let _smtp: ServerClient | null = null

const smtp = () => (_smtp ??= new ServerClient(config().POSTMARK_API_KEY))

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

export async function readUser(): Promise<User | undefined> {
  const session = await readSession()

  if (!session) return

  revalidateTag('iam')

  const user = await prisma().user.findUnique({
    where: { id: session.userId },
    include: {
      ImageBlob: true,
    },
  })

  if (!user) return

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

export async function readUsers(): Promise<User[]> {
  const { accountId } = await requireSession()

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

export async function deleteUser(userId: string): Promise<void> {
  const { accountId } = await requireSession()

  await prisma().user.delete({
    where: {
      accountId,
      id: userId,
    },
  })

  revalidateTag('iam')
}
