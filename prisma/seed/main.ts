import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
import { z } from 'zod'
import { config as loadDotenv } from 'dotenv'
import { expand as expandDotenv } from 'dotenv-expand'

expandDotenv(loadDotenv())

const config = z
  .object({
    SALT: z.string().min(1),
  })
  .parse(process.env)

async function main() {
  const prisma = new PrismaClient()

  const account = await prisma.account.create({
    data: {
      name: "Chris's Test Company",
    },
  })

  await prisma.user.create({
    data: {
      accountId: account.id,
      email: 'chris@kuech.dev',
      firstName: 'Christopher',
      lastName: 'Kuech',
      passwordHash: await hash('Zen123', config.SALT),
      requirePasswordReset: false,
    },
  })
}

main()
