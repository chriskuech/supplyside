import {
  Blob,
  Contact,
  Cost,
  Field,
  File,
  Option,
  Prisma,
  Resource,
  ResourceField,
  User,
  Value,
  ValueOption,
} from '@prisma/client'

export type ResourceModel = Resource & {
  ResourceField: ResourceFieldModel[]
  Cost: Cost[]
}

export type ResourceFieldModel = ResourceField & {
  Field: Field
  Value: ValueModel
}

export type ValueModel = Value & {
  Contact: Contact | null
  File: ValueFileModel | null
  Option: Option | null
  User: ValueUserModel | null
  Files: { File: ValueFileModel }[]
  ValueOption: ValueOptionModel[]
  Resource: ValueResourceModel | null
}

export type ValueFileModel = File & {
  Blob: Blob
}

export type ValueOptionModel = ValueOption & {
  Option: Option
}

export type ValueResourceModel = Resource & {
  ResourceField: (ResourceField & {
    Field: Field
    Value: Value
  })[]
}

export type ValueUserModel = User & { ImageBlob: Blob | null }

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
