import { mapValueModelToEntity } from '../resource/mappers'
import { SchemaField } from './entity'
import { FieldModel } from './model'

export const mapFieldModelToEntity = (model: FieldModel): SchemaField => ({
  id: model.id,
  templateId: model.templateId,
  name: model.name,
  description: model.description,
  type: model.type,
  options: model.Option.map((o) => ({
    id: o.id,
    name: o.name,
    templateId: o.templateId,
  })),
  resourceType: model.resourceType,
  defaultValue: model.DefaultValue && mapValueModelToEntity(model.DefaultValue),
  defaultToToday: model.defaultToToday,
  isRequired: model.isRequired,
})
