import assert from 'assert'
import { NextRequest, NextResponse } from 'next/server'
import { Message } from 'postmark'
import { container } from 'tsyringe'
import { createResource } from '@/domain/resource'
import { fields } from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema'
import { selectSchemaFieldUnsafe } from '@/domain/schema/extensions'
import { Resource } from '@/domain/resource/entity'
import BlobService from '@/domain/blob'
import SmtpService from '@/integrations/SmtpService'
import { PrismaService } from '@/integrations/PrismaService'

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
  const blobService = container.resolve(BlobService)
  const prisma = container.resolve(PrismaService)

  const billSchema = await readSchema({
    accountId: params.accountId,
    resourceType: 'Bill',
  })

  const fileIds = await Promise.all(
    params.files.map(async (file) => {
      const { id: blobId } = await blobService.createBlob({
        accountId: params.accountId,
        buffer: Buffer.from(file.content, file.encoding),
        type: file.contentType,
      })

      const { id: fileId } = await prisma.file.create({
        data: {
          accountId: params.accountId,
          name: file.fileName,
          blobId,
        },
      })

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
  const prisma = container.resolve(PrismaService)
  const smtpService = container.resolve(SmtpService)

  const body: Message = await req.json()

  // for some reason this is (sometimes?) wrapped in quotes
  const accountKey = body.To?.split('@').shift()?.replace(/^"/, '')

  assert(accountKey, 'Account key not found in To: ' + body.To)

  const account = await prisma.account.findUnique({
    where: { key: accountKey },
  })

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
