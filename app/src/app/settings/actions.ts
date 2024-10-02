'use server'

import { isTruthy } from 'remeda'
import { z } from 'zod'
import { createBlob } from '@/client/blob'
import { readSelf, updateSelf } from '@/client/user'
import { requireSession } from '@/session'

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
  const { userId } = await requireSession()
  const user = await readSelf(userId)

  if (!user) return

  const result = schema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return result.error.flatten().fieldErrors
  }

  const { firstName, lastName, file } = result.data

  const imageBlob = file && (await createBlob(user.accountId, file))

  const data = { firstName, lastName, imageBlobId: imageBlob?.id }

  if (!Object.values(data).some(isTruthy)) {
    return
  }

  await updateSelf(userId, data)
}
