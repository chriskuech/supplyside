import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import {
  TypedResource,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'
import {
  JobExtractionModel,
  JobExtractionModelSchema,
} from './JobExtractionModel'

const prompt = `
You are a context extraction tool within a "Procure-to-Pay" B2B SaaS application.
Your task is to extract relevant information from uploaded files associated with a Bill (aka Invoice).
The documents may contain a mix of images, text, and HTML content and the actual Bill file may or may not be included.
Your goal is to determine the Purchase Order (PO) number and the Vendor ID, if available; if the data is uncertain or ambiguous, do not include it in the output.

You will be provided with the following context:
- A "Vendor List" TSV file containing Vendor IDs and Vendor Names.
- The content of the uploaded documents associated with the Bill.

You MUST only return high-confidence data. If the data is uncertain or ambiguous, do not include it in the output.
`

@injectable()
export class JobExtractionService {
  constructor(
    @inject(OpenAiService) private readonly openai: OpenAiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
  ) {}

  async extractContent(accountId: string, resourceId: string) {
    const job = await this.resourceService.read(accountId, resourceId)
    const jobFiles = selectResourceFieldValue(job, fields.jobFiles)?.files

    if (!jobFiles?.length) return

    const model = await this.openai.extractContent({
      systemPrompt: prompt,
      schema: JobExtractionModelSchema,
      files: jobFiles,
    })

    if (!model) return

    await this.saveModel(accountId, resourceId, model)
  }

  private async saveModel(
    accountId: string,
    resourceId: string,
    model: JobExtractionModel,
  ) {
    const [job, jobSchema, lineSchema, [customer]] = await Promise.all([
      this.resourceService.read(accountId, resourceId),
      this.schemaService.readMergedSchema(accountId, 'Job'),
      this.schemaService.readMergedSchema(accountId, 'JobLine'),
      this.resourceService.findResourcesByNameOrPoNumber(
        accountId,
        'Customer',
        { input: model.customerName, take: 1 },
      ),
      this.resourceService.findResourcesByNameOrPoNumber(accountId, 'Part', {
        input: model.partName,
        take: 1,
      }),
    ])

    const { updatedFields } = new TypedResource(jobSchema, job)
      .setString(fields.name, model.name)
      .setString(fields.jobDescription, model.jobDescription)
      .setDate(fields.needDate, model.needDate)
      .setNumber(fields.totalCost, model.totalCost)
      .setResource(fields.customer, customer)

    await this.resourceService.update(accountId, resourceId, {
      fields: updatedFields,
      costs: model.itemizedCosts,
    })

    for (const line of model.lineItems) {
      const { updatedFields } = new TypedResource(lineSchema, null)
        .setNumber(fields.quantity, line.quantity)
        .setNumber(fields.unitCost, line.unitCost)
        .setNumber(fields.totalCost, line.totalCost)
        .setResource(fields.part, line.partId)
      await this.resourceService.create(accountId, 'JobLine', {
        fields: updatedFields,
      })
    }
  }
}
