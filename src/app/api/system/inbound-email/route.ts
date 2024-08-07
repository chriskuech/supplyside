'use server'

import { fail } from 'assert'
import { NextRequest, NextResponse } from 'next/server'
import { Message } from 'postmark'
import { createBlob } from '@/domain/blobs/actions'
import prisma from '@/lib/prisma'
import { createResource } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'
import smtp from '@/lib/smtp'

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

const createBill = async (params: Params) => {
  const fileIds = await Promise.all(
    params.files.map(async (file) => {
      const { id: blobId } = await createBlob({
        accountId: params.accountId,
        buffer: Buffer.from(file.content, file.encoding),
        type: file.contentType,
      })

      const { id: fileId } = await prisma().file.create({
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

  return await createResource({
    accountId: params.accountId,
    type: 'Bill',
    data: {
      [fields.billFiles.name]: fileIds,
    },
  })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: Message = await req.json()

  const accountKey = body.To?.split('@').shift() ?? fail()

  const account = await prisma().account.findUnique({
    where: { key: accountKey },
  })

  if (!account) {
    await smtp().sendEmail({
      From: 'SupplySide <bot@supplyside.io>',
      To: body.From,
      Subject: "We couldn't process your email",
      Attachments: body.Attachments,
      TextBody: `The account with key ${accountKey} does not exist.`,
    })

    return NextResponse.json({ error: 'Account does not exist' })
  }

  const { id: accountId } = account

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
    accountId,
    files: [...(email ? [email] : []), ...(attachments ?? [])],
  })

  return NextResponse.json({ success: true, bill })
}
