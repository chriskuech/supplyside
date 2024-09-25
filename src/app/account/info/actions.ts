'use server'

import { isTruthy } from 'remeda'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { container } from 'tsyringe'
import { readSession } from '@/lib/session/actions'
import BlobService from '@/domain/blob'
import { AccountService } from '@/domain/account'

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
  const accountService = container.resolve(AccountService)
  const blobService = container.resolve(BlobService)

  const { accountId } = await readSession()

  const result = schema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return result.error.flatten().fieldErrors
  }

  const { name, key, address, file } = result.data

  const logoBlobId = file
    ? await blobService.createBlob({ accountId, file }).then(({ id }) => id)
    : undefined

  const data = { name, key, address, logoBlobId }

  if (!Object.values(data).some(isTruthy)) {
    return
  }

  await accountService.update(accountId, data)

  revalidatePath('')
}
