import { ServerClient } from 'postmark'
import { inject, injectable } from 'inversify'
import { ConfigService } from '../ConfigService'
import { isTruthy } from 'remeda'

type User = { name?: string | null; email?: string | null };

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
    to?: User[] | null;
    cc?: User[] | null;
    replyTo?: User[] | null;
    templateAlias: string;
    templateModel: Record<string, unknown>;
    attachments?: {
      name: string;
      contentBase64: string;
      contentType: string;
    }[];
  }) {
    return this.client.sendEmailWithTemplate({
      From: 'SupplySide <bot@supplyside.io>',
      To: mapToEmails(params.to),
      Cc: mapToEmails(params.cc),
      ReplyTo: mapToEmails(params.replyTo),
      TemplateAlias: params.templateAlias,
      TemplateModel: params.templateModel,
      MessageStream: 'outbound',
      Attachments: params.attachments?.map((a) => ({
        Name: a.name,
        ContentID: '', // bad typings
        Content: a.contentBase64,
        ContentType: a.contentType,
      })),
    })
  }
}
