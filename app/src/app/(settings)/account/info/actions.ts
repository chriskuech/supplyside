'use server'

import { isTruthy } from 'remeda'
import { z } from 'zod'
import { requireSession } from '@/session'
import { createBlob } from '@/client/blob'
import { updateAccount } from '@/client/account'

const schema = z.object({
  name: z.string().min(1).optional(),
  key: z.string().min(1).toLowerCase().optional(),
  address: z.string().optional(),
  file: z
    .instanceof(File)
    .transform((file) => (file.size > 0 ? file : undefined)),
})

export type Dto = z.infer<typeof schema>

export type Errors = z.typeToFlattenedError<Dto>['fieldErrors']

export const handleSaveSettings = async (
  formData: FormData,
): Promise<Errors | undefined> => {
  const { accountId } = await requireSession()

  const result = schema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return result.error.flatten().fieldErrors
  }

  const { name, key, address, file } = result.data

  const logoBlobId =
    file && (await createBlob(accountId, file).then((blob) => blob?.id))

  const data = { name, key, address, logoBlobId }

  if (!Object.values(data).some(isTruthy)) {
    return
  }

  await updateAccount(accountId, data)
}
