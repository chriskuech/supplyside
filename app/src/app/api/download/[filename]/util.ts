import { mapValues } from 'remeda'
import { User } from '@supplyside/model'
import { File } from '@supplyside/model'
import { Query } from './schema'
import { Account } from '@/client/account'

const getDownloadPath = (fileName: string, { preview, ...query }: Query) =>
  `/api/download/${fileName}?${preview ? 'preview=true&' : ''}${new URLSearchParams(mapValues(query, encodeURIComponent)).toString()}`

export const download = (file: File | undefined) =>
  window.open(getFilePath(file))

export const preview = (file: File | undefined) =>
  window.open(getFilePath(file, true))

const getFilePath = (
  file: File | undefined,
  preview?: boolean,
): string | undefined =>
  file &&
  getDownloadPath(file.name, {
    preview: preview ? 'true' : undefined,
    type: 'file',
    fileId: file.id,
  })

export const getLogoPath = (account: Account | null | undefined) =>
  account?.logoBlobId
    ? getDownloadPath('logo', {
        type: 'logo',
        accountId: account.id,
      })
    : undefined

export const getProfilePicPath = (
  user: User | null | undefined,
): string | undefined =>
  user?.profilePicBlobId
    ? getDownloadPath('profile-pic', {
        type: 'profile-pic',
        userId: user.id,
      })
    : undefined
