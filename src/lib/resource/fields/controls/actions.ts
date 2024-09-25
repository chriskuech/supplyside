'use server'

import { container } from 'tsyringe'
import { readResource } from '@/domain/resource'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import { ValueResource } from '@/domain/resource/entity'
import { File, JsFile } from '@/domain/file/types'
import { withSession } from '@/lib/session/actions'
import { User } from '@/domain/user/entity'
import { UserService } from '@/domain/user'
import { FileService } from '@/domain/file'

type ResourceFieldActionParams = {
  resourceId: string
  fieldId: string
}

export const uploadFile = async (formData: FormData) =>
  withSession(async ({ accountId }) => {
    const fileService = container.resolve(FileService)

    const file = formData.get('file')

    if (!file || typeof file === 'string' || file.size === 0) return

    return await fileService.create(accountId, {
      name: file.name,
      file,
    })
  })

export const uploadFiles = async (formData: FormData) =>
  withSession(async ({ accountId }) => {
    const fileService = container.resolve(FileService)

    const files = formData.getAll('files')

    if (files.length === 0) return

    return Promise.all(
      files
        .filter((file): file is JsFile => typeof file !== 'string')
        .map((file) =>
          fileService.create(accountId, {
            name: file.name,
            file,
          }),
        ),
    )
  })

export const readResourceFieldFileAction = ({
  fieldId,
  resourceId,
}: ResourceFieldActionParams): Promise<File | undefined> =>
  withSession(({ accountId }) =>
    readResource({ accountId, id: resourceId }).then(
      (resource) =>
        selectResourceFieldValue(resource, { fieldId })?.file ?? undefined,
    ),
  )

export const readResourceFieldFilesAction = ({
  fieldId,
  resourceId,
}: ResourceFieldActionParams): Promise<File[] | undefined> =>
  withSession(({ accountId }) =>
    readResource({ accountId, id: resourceId }).then(
      (resource) =>
        selectResourceFieldValue(resource, { fieldId })?.files ?? [],
    ),
  )

export const readResourceFieldResourceAction = ({
  fieldId,
  resourceId,
}: ResourceFieldActionParams): Promise<ValueResource | undefined> =>
  withSession(({ accountId }) =>
    readResource({ accountId, id: resourceId }).then(
      (resource) =>
        selectResourceFieldValue(resource, { fieldId })?.resource ?? undefined,
    ),
  )

export const readResourceAction = ({
  resourceId,
}: {
  resourceId: string
}): Promise<Resource> =>
  withSession(({ accountId }) => readResource({ accountId, id: resourceId }))

export const readUsersAction = (): Promise<User[]> =>
  withSession(({ accountId }) => container.resolve(UserService).list(accountId))
