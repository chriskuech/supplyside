'use server'

import { Prisma } from '@prisma/client'
import { isEmpty } from 'remeda'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import prisma from '@/services/prisma'
import { createBlob } from '@/domain/blobs/actions'
import { readSession } from '@/lib/iam/actions'

type ClientErrors = Record<string, string[]>

export const handleSaveSettings = async (
  formData: FormData,
): Promise<ClientErrors | undefined> => {
  const { accountId } = await readSession()

  const result = z
    .object({
      name: z.string().min(1).optional(),
      key: z.string().min(1).toLowerCase().optional(),
      address: z.string().optional(),
    })
    .safeParse({
      name: formData.get('name') ?? undefined,
      key: formData.get('key') ?? undefined,
      address: formData.get('address') ?? undefined,
    })

  if (!result.success) {
    return result.error.flatten().fieldErrors
  }

  const data: Prisma.AccountUpdateInput = result.data

  const file = formData.get('file')
  if (file && typeof file !== 'string' && file.size > 0) {
    const { id: logoBlobId } = await createBlob({ accountId, file })

    data['LogoBlob'] = { connect: { id: logoBlobId } }
  }

  if (!isEmpty(data)) {
    await prisma().account.update({
      where: { id: accountId },
      data,
    })

    revalidatePath('')
  }
}
