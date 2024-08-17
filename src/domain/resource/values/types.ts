import { Blob, Contact, File, Prisma } from '@prisma/client'
import { fields } from '@/domain/schema/template/system-fields'
import { Option } from '@/domain/schema/types'
import { User } from '@/domain/iam/user/types'

export type ValueInput = {
  boolean?: boolean
  contact?: {
    name: string | null
    title: string | null
    email: string | null
    phone: string | null
  } | null
  date?: Date | null
  number?: number | null
  optionId?: string | null
  optionIds?: string[]
  string?: string | null
  userId?: string | null
  fileId?: string | null // This one's probably wrong if we are going to support previewing files before upload
  resourceId?: string | null
}

export type Value = {
  boolean: boolean | null
  contact: Contact | null
  date: Date | null
  number: number | null
  option: Option | null
  options?: Option[]
  string: string | null
  user: User | null
  file: (File & { Blob: Blob }) | null
  files?: (File & { Blob: Blob })[]
  resource: ValueResource | null
}

export type ValueResource = {
  id: string
  name: string
  key: number
}

export const valueInclude = {
  Contact: true,
  File: {
    include: {
      Blob: true,
    },
  },
  Files: {
    include: {
      File: {
        include: {
          Blob: true,
        },
      },
    },
  },
  Option: true,
  User: {
    include: {
      ImageBlob: true,
    },
  },
  ValueOption: {
    include: {
      Option: true,
    },
  },
  Resource: {
    include: {
      ResourceField: {
        where: {
          Field: {
            templateId: {
              in: [fields.name.templateId, fields.number.templateId],
            },
          },
        },
        include: {
          Field: true,
          Value: {
            include: {
              User: {
                include: {
                  ImageBlob: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ValueInclude
