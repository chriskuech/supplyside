'use server'

import { Prisma } from '@prisma/client'
import { isEmpty } from 'remeda'
import { revalidatePath } from 'next/cache'
import { container } from 'tsyringe'
import prisma from '@/integrations/prisma'
import { readSession } from '@/lib/session/actions'
import BlobService from '@/domain/blob'

type ClientErrors = Record<string, string>

export const handleSaveSettings = async (
  formData: FormData,
): Promise<ClientErrors | undefined> => {
  const { accountId, userId } = await readSession()

  const blobService = container.resolve(BlobService)

  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const file = formData.get('file')

  const errors: Record<string, string> = {}

  const update: Prisma.UserUpdateInput = {}

  if (file && typeof file !== 'string' && file.size > 0) {
    const { id: imageBlobId } = await blobService.createBlob({
      accountId,
      file,
    })

    update['ImageBlob'] = { connect: { id: imageBlobId } }
  }

  if (firstName !== null) {
    if (typeof firstName !== 'string') {
      errors['firstName'] = 'First name must be a string'
    } else if (!firstName.trim()) {
      errors['firstName'] = 'First name must not be empty'
    } else {
      update['firstName'] = firstName
    }
  }

  if (lastName !== null) {
    if (typeof lastName !== 'string') {
      errors['lastName'] = 'Last name must be a string'
    } else if (!lastName.trim()) {
      errors['lastName'] = 'Last name must not be empty'
    } else {
      update['lastName'] = lastName
    }
  }

  if (!isEmpty(update) && isEmpty(errors)) {
    await prisma().user.update({
      where: { id: userId },
      data: update,
    })

    revalidatePath('')
  } else {
    return errors
  }
}
