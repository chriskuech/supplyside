import assert from 'assert'
import { NextRequest, NextResponse } from 'next/server'
import { Message } from 'postmark'
import { container } from 'tsyringe'
import { createResource } from '@/domain/resource'
import { fields } from '@/domain/schema/template/system-fields'
import { selectSchemaFieldUnsafe } from '@/domain/schema/extensions'
import { Resource } from '@/domain/resource/entity'
import SmtpService from '@/integrations/SmtpService'
import { FileService } from '@/domain/file'
import { AccountService } from '@/domain/account'
import { SchemaService } from '@/domain/schema'

type FileParam = {
  content: string
  encoding: BufferEncoding
  contentType: string
  fileName: string
}

type Params = {
  accountId: string
  files: FileParam[]
}

const createBill = async (params: Params): Promise<Resource> => {
  const fileService = container.resolve(FileService)
  const schemaService = container.resolve(SchemaService)

  const billSchema = await schemaService.readSchema(params.accountId, 'Bill')

  const fileIds = await Promise.all(
    params.files.map(async (file) => {
      const { id: fileId } = await fileService.createFromBuffer(
        params.accountId,
        {
          name: file.fileName,
          buffer: Buffer.from(file.content, file.encoding),
          contentType: file.contentType,
        },
      )

      return fileId
    }),
  )

  console.log('Creating Bill', fileIds)

  const bill = await createResource({
    accountId: params.accountId,
    type: 'Bill',
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(billSchema, fields.billFiles).id,
        value: { fileIds },
      },
    ],
  })

  return bill
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const accountService = container.resolve(AccountService)
  const smtpService = container.resolve(SmtpService)

  const body: Message = await req.json()

  // for some reason this is (sometimes?) wrapped in quotes
  const accountKey = body.To?.split('@').shift()?.replace(/^"/, '')

  assert(accountKey, 'Account key not found in To: ' + body.To)

  const account = await accountService.readByKey(accountKey)

  if (!account) {
    await smtpService.sendEmail({
      From: 'SupplySide <bot@supplyside.io>',
      To: body.From,
      Subject: "We couldn't process your email",
      Attachments: body.Attachments,
      TextBody: `The account with key ${accountKey} does not exist.`,
    })

    return NextResponse.json({ error: 'Account does not exist' })
  }

  const attachments: FileParam[] | undefined = body.Attachments?.map(
    (attachment) => ({
      content: attachment.Content,
      encoding: 'base64',
      contentType: attachment.ContentType,
      fileName: attachment.Name,
    }),
  )

  const email: FileParam | null = body.HtmlBody
    ? {
        content: body.HtmlBody,
        encoding: 'utf-8',
        contentType: 'text/html',
        fileName: 'email.html',
      }
    : body.TextBody
      ? {
          content: body.TextBody,
          encoding: 'utf-8',
          contentType: 'text/plain',
          fileName: 'email.txt',
        }
      : null

  const bill = await createBill({
    accountId: account.id,
    files: [...(email ? [email] : []), ...(attachments ?? [])],
  })

  return NextResponse.json({ success: true, bill })
}
