import { inject, injectable } from 'inversify'
import { ServerClient } from 'postmark'
import { isTruthy } from 'remeda'
import { ConfigService } from '../ConfigService'

// const SUPPLY_SIDE_EMAIL = 'bot@supplyside.io'
const SUPPLY_SIDE_EMAIL = 'chris@kuech.dev'

type User = { name?: string | null; email?: string | null }

const mapToEmail = (user: User): string | undefined =>
  user.email ? `${user.name} <${user.email}>` : undefined

const mapToEmails = (users: User[] | null | undefined): string | undefined =>
  users?.map(mapToEmail).filter(isTruthy).join(', ')

@injectable()
export default class SmtpService {
  private readonly client: ServerClient

  constructor(@inject(ConfigService) { config }: ConfigService) {
    this.client = new ServerClient(config.POSTMARK_API_KEY)
  }

  sendEmail(params: {
    to?: User[] | null
    cc?: User[] | null
    replyTo?: User[] | null
    // templateAlias: string
    // templateModel: Record<string, unknown>
    subject: string
    textBody: string
    attachments?: {
      name: string
      contentBase64: string
      contentType: string
    }[]
  }) {
    return this.client.sendEmail({
      From: `SupplySide <${SUPPLY_SIDE_EMAIL}>`,
      To: mapToEmails(params.to),
      Cc: mapToEmails(params.cc),
      ReplyTo: mapToEmails(params.replyTo),
      Subject: params.subject,
      TextBody: params.textBody,
    })
    // return this.client.sendEmailWithTemplate({
    //   From: `SupplySide <${SUPPLY_SIDE_EMAIL}>`,
    //   To: mapToEmails(params.to),
    //   Cc: mapToEmails(params.cc),
    //   ReplyTo: mapToEmails(params.replyTo),
    //   TemplateAlias: params.templateAlias,
    //   TemplateModel: params.templateModel,
    //   MessageStream: 'outbound',
    //   Attachments: params.attachments?.map((a) => ({
    //     Name: a.name,
    //     ContentID: '', // bad typings
    //     Content: a.contentBase64,
    //     ContentType: a.contentType,
    //   })),
    // })
  }
}
