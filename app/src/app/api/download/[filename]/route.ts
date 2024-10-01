import { NextRequest, NextResponse } from 'next/server'
import { match } from 'ts-pattern'
import { querySchema } from './schema'
import { readBlob, readBlobData } from '@/client/blob'
import { requireSession } from '@/session'
import { readSelf } from '@/client/user'
import { readAccount } from '@/client/account'
import { readFile } from '@/client/files'

export async function GET(
  req: NextRequest,
  { params: { filename } }: { params: { filename: string } },
): Promise<NextResponse> {
  const notFound = () =>
    NextResponse.json({ error: 'Blob not found' }, { status: 404 })

  const query = querySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams.entries()),
  )

  const { accountId, blobId } = await match(query)
    .with({ type: 'profile-pic' }, async ({ userId }) => {
      const user = await readSelf(userId)
      if (!user) console.error('user not found', userId)
      return { accountId: user?.accountId, blobId: user?.profilePicBlobId }
    })
    .with({ type: 'logo' }, async ({ accountId }) => {
      const account = await readAccount(accountId)
      return { accountId, blobId: account?.logoBlobId }
    })
    .with({ type: 'file' }, async ({ fileId }) => {
      const { accountId } = await requireSession()
      const file = await readFile(accountId, fileId)
      return { accountId, blobId: file?.blobId }
    })
    .exhaustive()
  if (!accountId || !blobId) return notFound()

  console.log([accountId, blobId])
  const blob = await readBlob(accountId, blobId)
  if (!blob) return notFound()

  console.error(2)
  const data = await readBlobData(accountId, blobId)
  if (!data) return notFound()

  const contentType = blob.mimeType
  const encoding = contentType.startsWith('text/') ? 'utf-8' : undefined

  return new NextResponse(data, {
    headers: {
      'Content-Type': encoding
        ? `${contentType}; charset=${encoding}`
        : contentType,
      ...(query.preview
        ? { 'Content-Disposition': `attachment; filename=${filename}` }
        : undefined),
    },
  })
}
