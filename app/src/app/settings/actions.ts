'use server'

import { isTruthy } from 'remeda'
import { z } from 'zod'
import { createBlob } from '@/client/blob'
import { updateUser } from '@/client/user'
import { readSession } from '@/session'

const schema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  file: z
    .instanceof(File)
    .transform((file) => (file.size > 0 ? file : undefined))
    .optional(),
})

export type Dto = z.infer<typeof schema>

export type Errors = z.typeToFlattenedError<Dto>['fieldErrors']

export const handleSaveSettings = async (
  formData: FormData,
): Promise<Errors | undefined> => {
  const { accountId, userId } = await readSession()

  const result = schema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return result.error.flatten().fieldErrors
  }

  const { firstName, lastName, file } = result.data

  const imageBlobId = file
    ? await createBlob({ accountId, file }).then(({ id }) => id)
    : undefined

  const data = { firstName, lastName, imageBlobId }

  if (!Object.values(data).some(isTruthy)) {
    return
  }

  await updateUser(accountId, userId, data)
}
