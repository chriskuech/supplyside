import { ServerClient } from 'postmark'
import { inject, injectable } from 'inversify'
import { ConfigService } from '../ConfigService'

@injectable()
export default class SmtpService extends ServerClient {
  constructor(@inject(ConfigService) { config }: ConfigService) {
    super(config.POSTMARK_API_KEY)
  }
}
