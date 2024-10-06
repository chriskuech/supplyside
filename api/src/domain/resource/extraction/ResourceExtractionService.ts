import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import { inject, injectable } from 'inversify'
import { SchemaService } from '../../schema/SchemaService'
import { ResourceService } from '../ResourceService'
import {
  ResourceType,
  Schema,
  ValueInput,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import {
  ExtractionFieldModel,
  ExtractionModel,
  ExtractionModelSchema,
} from './ResourceExtractionModel'
import { P, match } from 'ts-pattern'
import { sanitizeLineSchema, sanitizeSchema } from './mappers'
import { prompt } from './prompt'
import { isTruthy } from 'remeda'
import assert from 'assert'

@injectable()
export class ResourceExtractionService {
  constructor(
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(OpenAiService) private readonly openAiService: OpenAiService,
  ) {}

  /**
   *
   * @param accountId The account ID of the resource to extract content from.
   * @param resourceId The resource ID of the resource to extract content from.
   * @param data The field ID of the field containing the file(s) to extract content from.
   */
  async extractAndApplyContent(
    accountId: string,
    resourceId: string,
    data: { fieldId: string },
  ): Promise<void> {
    const model = await this.extractContent(accountId, resourceId, data)

    assert(model, 'Failed to extract content')

    await this.applyExtractedContent(accountId, resourceId, model)
  }

  async extractContent(
    accountId: string,
    resourceId: string,
    data: { fieldId: string },
  ): Promise<ExtractionModel | undefined> {
    const resource = await this.resourceService.read(accountId, resourceId)

    const lineType = match<ResourceType, ResourceType | null>(resource.type)
      .with('Purchase', () => 'PurchaseLine')
      .with('Bill', () => 'PurchaseLine')
      .with('Job', () => 'JobLine')
      .otherwise(() => null)
    const csvTypes = match<ResourceType, ResourceType[]>(resource.type)
      .with('Purchase', () => ['Vendor', 'Item'])
      .with('Bill', () => ['Vendor', 'Item'])
      .with('Job', () => ['Customer', 'Part'])
      .otherwise(() => [])

    const [schema, lineSchema]: [Schema, Schema | null] = await Promise.all([
      this.schemaService.readMergedSchema(accountId, resource.type),
      lineType && this.schemaService.readMergedSchema(accountId, lineType),
    ])

    const { file, files } = selectResourceFieldValue(resource, data) ?? {}

    const csvs = await Promise.all(
      csvTypes.map((type) =>
        match(type)
          .with(P.union('Customer', 'Item', 'Part', 'Vendor'), (type) =>
            this.createResourceListCsv(accountId, type),
          )
          .otherwise(() => null),
      ),
    )

    const systemPrompt: string = prompt({
      resourceType: resource.type,
      schemaFields: sanitizeSchema(schema.fields),
      lineSchemaFields: lineSchema && sanitizeLineSchema(lineSchema.fields),
      csvs: csvs.filter(isTruthy),
    })

    const result = await this.openAiService.extractContent({
      systemPrompt: systemPrompt,
      schema: ExtractionModelSchema,
      files: [...(file ? [file] : []), ...(files ?? [])],
    })

    return result
  }

  async applyExtractedContent(
    accountId: string,
    resourceId: string,
    { costs, headerFields, lines }: ExtractionModel,
  ) {
    await this.resourceService.update(accountId, resourceId, {
      fields: headerFields.map((field) => ({
        fieldId: field.fieldId,
        valueInput:
          ResourceExtractionService.mapExtractionFieldModelToValueInput(field),
      })),
      costs,
    })

    for (const line of lines) {
      await this.resourceService.create(accountId, 'PurchaseLine', {
        // TODO: !!! this must be dynamic for Jobs
        fields: line.fields.map((field) => ({
          fieldId: field.fieldId,
          valueInput:
            ResourceExtractionService.mapExtractionFieldModelToValueInput(
              field,
            ),
        })),
      })
    }
  }

  private async createResourceListCsv(
    accountId: string,
    resourceType: 'Customer' | 'Item' | 'Part' | 'Vendor',
  ) {
    const resources = await this.resourceService.list(accountId, resourceType)

    const header = ['ID', fields.name.name]
    const rows = resources
      .map((resource) => [
        resource.id,
        selectResourceFieldValue(resource, fields.name)?.string?.replace(
          '"',
          '',
        ),
      ])
      .filter(([, name]) => !!name)

    return {
      name: `${resourceType}s list`,
      content: [header, ...rows]
        .map((row) => row.map((value) => `"${value}"`).join(','))
        .join('\n'),
    }
  }

  private static mapExtractionFieldModelToValueInput(
    field: ExtractionFieldModel,
  ): ValueInput {
    return match<ExtractionFieldModel, ValueInput>(field)
      .with({ type: 'Address' }, ({ address }) => ({ address }))
      .with({ type: 'Checkbox' }, ({ boolean }) => ({ boolean }))
      .with({ type: 'Contact' }, ({ contact }) => ({ contact }))
      .with({ type: 'Date' }, ({ date }) => ({
        date: date ? new Date(date).toISOString() : null,
      }))
      .with({ type: 'Money' }, ({ number }) => ({ number }))
      .with({ type: 'MultiSelect' }, ({ optionIds }) => ({ optionIds }))
      .with({ type: 'Number' }, ({ number }) => ({ number }))
      .with({ type: 'Select' }, ({ optionId }) => ({ optionId }))
      .with({ type: 'Text' }, ({ string }) => ({ string }))
      .with({ type: 'Textarea' }, ({ string }) => ({ string }))
      .with({ type: 'User' }, ({ userId }) => ({ userId }))
      .with({ type: 'Resource' }, ({ resourceId }) => ({ resourceId }))
      .exhaustive()
  }
}
