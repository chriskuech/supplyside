import { Prisma, ResourceType } from '@prisma/client'
import { Option } from '@/domain/schema/types'
import { User } from '@/domain/iam/user/types'
import { File } from '@/domain/files/types'

export type ValueContact = {
  name: string | null
  title: string | null
  email: string | null
  phone: string | null
}

// export type ValueInput =
//   | { boolean: boolean | null }
//   | { contact: ValueContact | null }
//   | { date: Date | null }
//   | { number: number | null }
//   | { optionId: string | null }
//   | { optionIds: string[] }
//   | { string: string | null }
//   | { userId: string | null }
//   | { fileId: string | null }
//   | { fileIds: string[] }
//   | { resourceId: string | null }

export type ValueInput = {
  boolean?: boolean | null
  contact?: ValueContact | null
  date?: Date | null
  fileId?: string | null
  fileIds?: string[]
  number?: number | null
  optionId?: string | null
  optionIds?: string[]
  resourceId?: string | null
  string?: string | null
  userId?: string | null
}

export type Value = {
  boolean: boolean | null
  contact: ValueContact | null
  date: Date | null
  number: number | null
  option: Option | null
  options?: Option[]
  string: string | null
  user: User | null
  file: File | null
  files: File[]
  resource: ValueResource | null
}

export type ValueResource = {
  id: string
  type: ResourceType
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
        // This snippets prevents pulling n^2 data, but the prisma runtime has a bug that prevents it from working
        // where: {
        //   Field: {
        //     templateId: {
        //       in: [fields.name.templateId, fields.number.templateId],
        //     },
        //   },
        // },
        include: {
          Field: true,
          Value: true,
        },
      },
    },
  },
} satisfies Prisma.ValueInclude
