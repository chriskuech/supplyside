'use server'

import { withAccountId } from '@/authz'

export const uploadFile = withAccountId(
  async (accountId, formData: FormData) => {
    // const file = formData.get('file')
    // if (!file || typeof file === 'string' || file.size === 0) return
    // return await createFromFile(accountId, {
    //   name: file.name,
    //   file,
    // })
  },
)

export const uploadFiles = withAccountId(
  async (accountId, formData: FormData) => {
    // const files = formData.getAll('files')
    // if (files.length === 0) return
    // return Promise.all(
    //   files
    //     .filter((file): file is File => typeof file !== 'string')
    //     .map((file) =>
    //       createFromFile(accountId, {
    //         name: file.name,
    //         file,
    //       }),
    //     ),
    // )
  },
)
