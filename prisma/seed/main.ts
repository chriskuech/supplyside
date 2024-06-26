import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
import { z } from 'zod'
import { config as loadDotenv } from 'dotenv'
import { expand as expandDotenv } from 'dotenv-expand'
import { systemAccountId } from '../../src/lib/const'

expandDotenv(loadDotenv())

const config = z
  .object({
    SALT: z.string().min(1),
    DEV_EMAIL: z.string().email(),
    DEV_FIRST_NAME: z.string().min(1),
    DEV_LAST_NAME: z.string().min(1),
    DEV_PASSWORD: z.string().min(1),
  })
  .parse(process.env)

const testId = '00000000-0000-0000-0000-000000000001'

async function main() {
  const prisma = new PrismaClient()

  await prisma.account.create({
    data: {
      id: systemAccountId,
      name: 'SYSTEM',
    },
  })

  await prisma.user.create({
    data: {
      id: systemAccountId,
      accountId: systemAccountId,
      email: config.DEV_EMAIL,
      firstName: config.DEV_FIRST_NAME,
      lastName: config.DEV_LAST_NAME,
      passwordHash: await hash(config.DEV_PASSWORD, config.SALT),
      requirePasswordReset: false,
    },
  })

  await prisma.account.create({
    data: {
      id: testId,
      name: `${config.DEV_FIRST_NAME}'s Test Company`,
    },
  })
}

main()
