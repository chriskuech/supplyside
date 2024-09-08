'use server'

import { readResource } from '@/domain/resource/actions'
import { Resource, selectResourceField } from '@/domain/resource/types'
import { ValueResource } from '@/domain/resource/values/types'
import { File, JsFile } from '@/domain/files/types'
import { createFile } from '@/domain/files'
import { withSession } from '@/lib/session/actions'
import { readUsers } from '@/domain/iam/user/actions'
import { User } from '@/domain/iam/user/types'

type ResourceFieldActionParams = {
  resourceId: string
  fieldId: string
}

export const uploadFile = async (formData: FormData) =>
  withSession(async ({ accountId }) => {
    const file = formData.get('file')

    if (!file || typeof file === 'string' || file.size === 0) return

    return await createFile({
      accountId,
      name: file.name,
      file,
    })
  })

export const uploadFiles = async (formData: FormData) =>
  withSession(async ({ accountId }) => {
    const files = formData.getAll('files')

    if (files.length === 0) return

    return Promise.all(
      files
        .filter((file): file is JsFile => typeof file !== 'string')
        .map((file) =>
          createFile({
            accountId,
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
        selectResourceField(resource, { fieldId })?.file ?? undefined,
    ),
  )

export const readResourceFieldFilesAction = ({
  fieldId,
  resourceId,
}: ResourceFieldActionParams): Promise<File[] | undefined> =>
  withSession(({ accountId }) =>
    readResource({ accountId, id: resourceId }).then(
      (resource) => selectResourceField(resource, { fieldId })?.files ?? [],
    ),
  )

export const readResourceFieldResourceAction = ({
  fieldId,
  resourceId,
}: ResourceFieldActionParams): Promise<ValueResource | undefined> =>
  withSession(({ accountId }) =>
    readResource({ accountId, id: resourceId }).then(
      (resource) =>
        selectResourceField(resource, { fieldId })?.resource ?? undefined,
    ),
  )

export const readResourceAction = ({
  resourceId,
}: {
  resourceId: string
}): Promise<Resource> =>
  withSession(({ accountId }) => readResource({ accountId, id: resourceId }))

export const readUsersAction = (): Promise<User[]> =>
  withSession(({ accountId }) => readUsers({ accountId }))
