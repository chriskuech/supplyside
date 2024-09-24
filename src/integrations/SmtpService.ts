import { ServerClient } from 'postmark'
import { singleton } from 'tsyringe'
import ConfigService from './ConfigService'

@singleton()
export default class SmtpService extends ServerClient {
  constructor(configService: ConfigService) {
    super(configService.config.POSTMARK_API_KEY)
  }
}
