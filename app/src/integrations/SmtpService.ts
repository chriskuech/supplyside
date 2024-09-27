import { ServerClient } from 'postmark'
import { injectable } from 'inversify'
import ConfigService from './ConfigService'

@injectable()
export default class SmtpService extends ServerClient {
  constructor(configService: ConfigService) {
    super(configService.config.POSTMARK_API_KEY)
  }
}
