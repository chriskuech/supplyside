'use server'

import { ServerClient } from 'postmark'
import { faker } from '@faker-js/faker'
import { hash } from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { config } from '@/lib/config'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/auth'

const smtp = new ServerClient(config.POSTMARK_API_KEY)

export async function inviteUser(email: string) {
  const { accountId } = await requireSession()

  const password = faker.string.nanoid()

  await prisma.user.create({
    data: {
      email,
      accountId,
      passwordHash: await hash(password, config.SALT),
      requirePasswordReset: true,
    },
  })

  await smtp.sendEmail({
    From: 'bot@kuech.dev',
    To: email,
    Subject: 'Hello from Zen Procure',
    HtmlBody: renderInviteTemplate({ email, password }),
    MessageStream: 'broadcast',
  })

  revalidatePath('.')
}

export async function deleteUser(userId: string) {
  const { accountId } = await requireSession()

  await prisma.user.delete({
    where: {
      accountId,
      id: userId,
    },
  })

  revalidatePath('.')
}

const loginUrl = 'http://localhost:3000/auth/login'

const renderInviteTemplate = (d: { email: string; password: string }) => `
  <h3>Welcome to ZenProcure!<h3>

  <p>Use the temporary email and password below to log into <a href="${loginUrl}">${loginUrl}</a>.</p>

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
