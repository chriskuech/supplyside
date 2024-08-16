'use server'

import { revalidatePath } from 'next/cache'
import { faker } from '@faker-js/faker'
import { Account as AccountCoreModel, Blob, Prisma } from '@prisma/client'
import { applyTemplate } from '../schema/template/actions'
import { getDownloadPath } from '../blobs/utils'
import prisma from '@/lib/prisma'

export type Account = {
  id: string
  key: string
  name: string
  address: string
  logoPath: string | null
  logoBlobId: string | null
}

export type AccountModel = AccountCoreModel & {
  LogoBlob: Blob | null
}

export const accountInclude = {
  LogoBlob: true,
} satisfies Prisma.AccountInclude

export const mapAccountModel = (model: AccountModel): Account => ({
  id: model.id,
  key: model.key,
  name: model.name,
  address: model.address,
  logoPath:
    model.LogoBlob &&
    getDownloadPath({
      blobId: model.LogoBlob.id,
      mimeType: model.LogoBlob.mimeType,
      fileName: 'logo',
    }),
  logoBlobId: model.LogoBlob?.id ?? null,
})

export const createAccount = async (): Promise<void> => {
  const temporaryKey = faker.string.alpha({ casing: 'lower', length: 5 })

  const { id: accountId } = await prisma().account.create({
    data: {
      key: temporaryKey,
      name: 'New Account - ' + temporaryKey,
    },
  })

  await applyTemplate(accountId)

  revalidatePath('')
}

export const readAccount = async (accountId: string): Promise<Account> => {
  const model = await prisma().account.findUniqueOrThrow({
    where: {
      id: accountId,
    },
    include: accountInclude,
  })

  revalidatePath('')

  return mapAccountModel(model)
}

export const deleteAccount = async (accountId: string): Promise<void> => {
  await prisma().account.delete({
    where: {
      id: accountId,
    },
  })

  revalidatePath('')
}
