'use server'

import { fail } from 'assert'
import { NextRequest, NextResponse } from 'next/server'
import { Message } from 'postmark'
import { createBlob } from '@/domain/blobs/actions'
import prisma from '@/lib/prisma'
import { createResource } from '@/domain/resource/actions'
// import smtp from '@/lib/smtp'

type Params = {
  accountId: string
  content: string
  encoding: BufferEncoding
  contentType: `${string}/${string}`
  fileName: string
}

const createBill = async ({
  accountId,
  content,
  encoding,
  contentType,
  fileName,
}: Params) => {
  const blob = await createBlob({
    accountId,
    buffer: Buffer.from(content, encoding),
    type: contentType,
  })

  const file = await prisma().file.create({
    data: {
      accountId,
      name: fileName,
      blobId: blob.id,
    },
  })

  return await createResource({
    accountId,
    type: 'Bill',
    data: {
      Document: file.id,
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
    // await smtp().sendEmailWithTemplate({
    //   From: 'bot@supplyside.io',
    //   To: body.From,
    //   Subject: "We couldn't process your email",
    //   Attachments: body.Attachments,
    // })
    return NextResponse.json({ error: 'Account does not exist' })
  }

  const { id: accountId } = account
  const attachment = body.Attachments?.find(
    (a) => a.ContentType === 'application/pdf',
  )

  const params: Params | null = attachment
    ? {
        accountId,
        content: attachment.Content,
        encoding: 'base64',
        contentType: 'application/pdf',
        fileName: attachment.Name,
      }
    : body.HtmlBody
      ? {
          accountId,
          content: body.HtmlBody,
          encoding: 'utf-8',
          contentType: 'text/html',
          fileName: 'email.html',
        }
      : body.TextBody
        ? {
            accountId,
            content: body.TextBody,
            encoding: 'utf-8',
            contentType: 'text/plain',
            fileName: 'email.txt',
          }
        : null

  if (!params) {
    return NextResponse.json({ error: 'Failed to infer the type' })
  }

  const bill = await createBill(params)

  return NextResponse.json({ success: true, bill })
}
