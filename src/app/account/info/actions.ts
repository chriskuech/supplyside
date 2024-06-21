'use server'

import { Prisma } from '@prisma/client'
import { isEmpty } from 'remeda'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { createBlob } from '@/domain/blobs/actions'

type ClientErrors = Record<string, string>

export const handleSaveSettings = async (
  formData: FormData,
): Promise<ClientErrors | undefined> => {
  const { accountId } = await requireSession()

  const name = formData.get('name')
  const file = formData.get('file')

  const errors: Record<string, string> = {}

  const update: Prisma.AccountUpdateInput = {}

  if (file && typeof file !== 'string' && file.size > 0) {
    const { id: logoBlobId } = await createBlob({ accountId, file })

    update['LogoBlob'] = { connect: { id: logoBlobId } }
  }

  if (name !== null) {
    if (typeof name !== 'string') {
      errors['name'] = 'First name must be a string'
    } else if (!name.trim()) {
      errors['name'] = 'First name must not be empty'
    } else {
      update['name'] = name
    }
  }

  if (!isEmpty(update) && isEmpty(errors)) {
    await prisma.account.update({
      where: { id: accountId },
      data: update,
    })

    revalidateTag('iam')
  } else {
    return errors
  }
}
