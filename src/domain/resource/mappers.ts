import {
  Prisma,
  ResourceField as ResourceFieldModel,
  Resource as ResourceModel,
  Field as FieldModel,
  Value as ValueModel,
  Contact as ContactModel,
  Option as OptionModel,
  User as UserModel,
  ValueOption as ValueOptionModel,
  Blob as BlobModel,
  File as FileModel,
} from '@prisma/client'
import { fields } from '../schema/template/system-fields'
import { getDownloadPath } from '../blobs/utils'
import { Resource } from './types'

export const include = {
  ResourceField: {
    include: {
      Field: true,
      Value: {
        include: {
          Contact: true,
          File: {
            include: {
              Blob: true,
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
        },
      },
    },
  },
} satisfies Prisma.ResourceInclude

export const mapResource = (
  model: ResourceModel & {
    ResourceField: (ResourceFieldModel & {
      Field: FieldModel
      Value: ValueModel & {
        Contact: ContactModel | null
        File: (FileModel & { Blob: BlobModel }) | null
        Option: OptionModel | null
        User: (UserModel & { ImageBlob: BlobModel | null }) | null
        ValueOption: (ValueOptionModel & { Option: OptionModel })[]
        Resource:
          | (ResourceModel & {
              ResourceField: (ResourceFieldModel & {
                Field: FieldModel
                Value: ValueModel
              })[]
            })
          | null
      }
    })[]
  },
): Resource => ({
  id: model.id,
  key: model.key,
  rev: model.revision,
  type: model.type,
  createdAt: model.createdAt,
  isActive: model.isActive,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    fieldType: rf.Field.type,
    templateId: rf.Field.templateId,
    value: {
      boolean: rf.Value.boolean,
      contact: rf.Value.Contact,
      date: rf.Value.date,
      string: rf.Value.string,
      number: rf.Value.number,
      option: rf.Value.Option,
      options: rf.Value.ValueOption.map((vo) => vo.Option),
      user: rf.Value.User && {
        email: rf.Value.User.email,
        firstName: rf.Value.User.firstName,
        fullName: `${rf.Value.User.firstName} ${rf.Value.User.lastName}`,
        id: rf.Value.User.id,
        lastName: rf.Value.User.lastName,
        profilePicPath:
          rf.Value.User.ImageBlob &&
          getDownloadPath({
            blobId: rf.Value.User.ImageBlob.id,
            mimeType: rf.Value.User.ImageBlob.mimeType,
            fileName: 'profile-pic',
          }),
      },
      resource: rf.Value.Resource && {
        id: rf.Value.Resource.id,
        key: rf.Value.Resource.key,
        name:
          rf.Value.Resource.ResourceField.find(
            (rf) =>
              rf.Field.templateId &&
              (
                [fields.name.templateId, fields.number.templateId] as string[]
              ).includes(rf.Field.templateId),
          )?.Value.string ?? '',
      },
      file: rf.Value.File,
    },
  })),
})
