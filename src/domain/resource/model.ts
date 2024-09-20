import {
  Address,
  Blob,
  Contact,
  Field,
  Option,
  User,
  Value,
  ValueOption,
  Resource,
  ResourceField,
  Prisma,
  Cost,
} from '@prisma/client'
import { userInclude } from '../user/model'
import { FileModel } from '@/domain/files/model'

export type ResourceModel = Resource & {
  Cost: Cost[]
  ResourceField: (ResourceField & {
    Field: Field
    Value: ValueModel
  })[]
}

export type ValueResourceModel = Resource & {
  ResourceField: (ResourceField & {
    Field: Field
    Value: Value
  })[]
}

export type ValueModel = Value & {
  Address: Address | null
  Contact: Contact | null
  File: FileModel | null
  Option: Option | null
  User: (User & { ImageBlob: Blob | null }) | null
  Files: { File: FileModel }[]
  ValueOption: (ValueOption & { Option: Option })[]
  Resource: ValueResourceModel | null
}

export const valueInclude = {
  Address: true,
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
    include: userInclude,
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

export const resourceInclude = {
  Cost: {
    orderBy: { createdAt: 'asc' },
  },
  ResourceField: {
    include: {
      Field: true,
      Value: {
        include: valueInclude,
      },
    },
  },
} satisfies Prisma.ResourceInclude
