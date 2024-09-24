import { ServerClient } from 'postmark'
import { singleton } from 'tsyringe'
import config from './config'

@singleton()
export default class SmtpService extends ServerClient {
  constructor() {
    super(config().POSTMARK_API_KEY)
  }
}
