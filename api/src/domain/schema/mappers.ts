import { Schema, SchemaField } from '@supplyside/model'
import { mapValueModelToEntity } from '../resource/mappers'
import { FieldModel, SchemaModel } from './model'

export const mapSchemaModelToEntity = (model: SchemaModel): Schema => ({
  resourceType: model.resourceType,
  sections: model.Section.flatMap((s) => ({
    id: s.id,
    name: s.name,
    fields: s.SectionField.map((sf) => sf.Field).map(mapFieldModelToEntity),
  })),
  fields: [
    ...model.SchemaField,
    ...model.Section.flatMap((s) => s.SectionField),
  ]
    .map((sf) => sf.Field)
    .map(mapFieldModelToEntity),
})

export const mapFieldModelToEntity = (model: FieldModel): SchemaField => ({
  fieldId: model.id,
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
