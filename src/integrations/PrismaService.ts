import { PrismaClient } from '@prisma/client'
import { singleton } from 'tsyringe'

@singleton()
export class PrismaService extends PrismaClient {
  constructor() {
    super()
    this.$connect()
    process.on('exit', () => this?.$disconnect())
  }
}
