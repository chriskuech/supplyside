'use server'
import { isTruthy } from 'remeda'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readSession } from '@/lib/session/actions'
import { BlobService } from '@/domain/blob/BlobService'
import { UserService } from '@/domain/user'
import { container } from '@/lib/di'

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
  const blobService = container().resolve(BlobService)
  const userService = container().resolve(UserService)

  const {
    // use the non-impersonated accountId and userId
    user: { accountId, id: userId },
  } = await readSession()

  const result = schema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return result.error.flatten().fieldErrors
  }

  const { firstName, lastName, file } = result.data

  const imageBlobId = file
    ? await blobService.createBlob({ accountId, file }).then(({ id }) => id)
    : undefined

  const data = { firstName, lastName, imageBlobId }

  if (!Object.values(data).some(isTruthy)) {
    return
  }

  await userService.update(accountId, userId, data)

  revalidatePath('')
}
