import { isTruthy } from 'remeda'
import { fields } from '../schema/template/system-fields'
import { getDownloadPath } from '../blobs/utils'
import { Resource, Value, ValueFile, ValueResource, ValueUser } from './entity'
import {
  ResourceModel,
  ValueFileModel,
  ValueModel,
  ValueResourceModel,
  ValueUserModel,
} from './model'

export const mapResourceModelToEntity = (model: ResourceModel): Resource => ({
  id: model.id,
  accountId: model.accountId,
  key: model.key,
  type: model.type,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    fieldType: rf.Field.type,
    templateId: rf.Field.templateId,
    name: rf.Field.name,
    value: mapValueModelToEntity(rf.Value),
  })),
  costs: model.Cost,
})

export const mapValueModelToEntity = (model: ValueModel): Value => ({
  boolean: model.boolean,
  contact: model.Contact,
  date: model.date,
  string: model.string,
  number: model.number,
  option: model.Option,
  options: model.ValueOption.map((vo) => vo.Option),
  user: model.User && mapValueUserModelToEntity(model.User),
  resource: model.Resource && mapValueResourceModelToEntity(model.Resource),
  file: model.File && mapValueFileModelToEntity(model.File),
  files: model.Files.map(({ File: file }) => file).map(
    mapValueFileModelToEntity,
  ),
})

export const mapValueFileModelToEntity = (
  model: ValueFileModel,
): ValueFile => ({
  blobId: model.blobId,
  id: model.id,
  name: model.name,
  contentType: model.Blob.mimeType,
  downloadPath: getDownloadPath({
    blobId: model.blobId,
    fileName: model.name,
    mimeType: model.Blob.mimeType,
    isPreview: true,
  }),
  previewPath: getDownloadPath({
    blobId: model.blobId,
    fileName: model.name,
    mimeType: model.Blob.mimeType,
    isPreview: false,
  }),
})

export const mapValueUserModelToEntity = (
  model: ValueUserModel,
): ValueUser => ({
  id: model.id,
  firstName: model.firstName,
  lastName: model.lastName,
  fullName:
    [model.firstName, model.lastName].filter(isTruthy).join(' ') || null,
  email: model.email,
  profilePicPath:
    model.ImageBlob &&
    getDownloadPath({
      fileName: model.ImageBlob.name,
      mimeType: model.ImageBlob.mimeType,
      blobId: model.ImageBlob.id,
    }),
})

export const mapValueResourceModelToEntity = (
  model: ValueResourceModel,
): ValueResource => ({
  id: model.id,
  key: model.key,
  name:
    model.ResourceField.find(
      (rf) =>
        rf.Field.templateId &&
        (
          [fields.name.templateId, fields.number.templateId] as string[]
        ).includes(rf.Field.templateId),
    )?.Value.string ?? '',
})
