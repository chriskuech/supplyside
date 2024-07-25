'use server'

import { NextRequest, NextResponse } from 'next/server'
import { Message } from 'postmark'
import { createBlob } from '@/domain/blobs/actions'
import prisma from '@/lib/prisma'
import { createResource } from '@/domain/resource/actions'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: Message = await req.json()

  const accountKey = body.To?.split('@').shift()

  const account = await prisma().account.findUnique({
    where: { key: accountKey },
  })

  if (!account)
    return NextResponse.json(
      { error: 'Bad Request: Account does not exist' },
      { status: 400 },
    )

  for (const attachment of body.Attachments ?? []) {
    if (attachment.ContentType !== 'application/pdf') continue

    const blob = await createBlob({
      accountId: account.id,
      buffer: Buffer.from(attachment.Content, 'base64'),
      type: 'application/pdf',
    })

    const file = await prisma().file.create({
      data: {
        accountId: account.id,
        name: attachment.Name,
        blobId: blob.id,
      },
    })

    await createResource({
      accountId: account.id,
      type: 'Bill',
      data: {
        Document: file.id,
      },
    })
  }

  return NextResponse.json({ success: true })
}
