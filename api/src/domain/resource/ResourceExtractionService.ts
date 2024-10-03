import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import { inject, injectable } from 'inversify'
import { SchemaService } from '../schema/SchemaService'
import { ResourceService } from './ResourceService'
import { ResourceType, selectResourceFieldValue } from '@supplyside/model'
import { mapSchemaEntityToZod } from '../schema/mappers'

const prompt = (resourceType: ResourceType) =>
  `You are a context extraction tool within a "Procure-to-Pay" B2B SaaS application.
Your task is to extract relevant information from uploaded files associated with a ${resourceType}.
The documents may contain a mix of images, text, and HTML content and the actual ${resourceType} file may or may not be included.
Your goal is to determine the Purchase Order (PO) number and the Vendor ID, if available; if the data is uncertain or ambiguous, do not include it in the output.

You will be provided with the following context:
- A "Vendor List" TSV file containing Vendor IDs and Vendor Names.
- The content of the uploaded documents associated with the ${resourceType}.

You MUST only return high-confidence data. If the data is uncertain or ambiguous, do not include it in the output.`

@injectable()
export class ResourceExtractionService {
  constructor(
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(OpenAiService) private readonly openAiService: OpenAiService
  ) {}

  async extractContent(
    accountId: string,
    resourceId: string,
    data: { fieldId: string }
  ) {
    const resource = await this.resourceService.read(accountId, resourceId)
    const schema = await this.schemaService.readMergedSchema(
      accountId,
      resource.type
    )

    const { file, files } = selectResourceFieldValue(resource, data) ?? {}

    const result = await this.openAiService.extractContent({
      systemPrompt: prompt(resource.type),
      schema: mapSchemaEntityToZod(schema),
      files: [...(file ? [file] : []), ...(files ?? [])],
    })

    return result
  }
}
