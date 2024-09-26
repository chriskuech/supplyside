import { PrismaClient } from '@prisma/client'
import { injectable } from 'inversify'

@injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super()
    this.$connect()
    process.on('exit', () => this?.$disconnect())
  }
}
