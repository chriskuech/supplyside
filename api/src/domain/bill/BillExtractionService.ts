import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import {
  TypedResource,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'
import { BillExtractionModelSchema } from './BillExtractionModel'

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
export class BillExtractionService {
  constructor(
    @inject(OpenAiService) private readonly openai: OpenAiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
  ) {}

  async extractContent(accountId: string, resourceId: string) {
    const bill = await this.resourceService.read(accountId, resourceId)
    const billFiles = selectResourceFieldValue(bill, fields.billFiles)?.files

    if (!billFiles?.length) return

    const model = await this.openai.extractContent({
      systemPrompt: prompt,
      schema: BillExtractionModelSchema,
      files: billFiles,
    })

    if (!model) return

    const {
      itemizedCosts,
      // lineItems, // TODO: add line items
      vendorName,

      billingContact,
      invoiceNumber,
      invoiceDate,
      poNumber,
      purchaseDescription,
      paymentTerms,
      // paymentMethod, // TODO: add payment method
    } = model

    const [billSchema, billResource] = await Promise.all([
      this.schemaService.readMergedSchema(accountId, 'Bill'),
      this.resourceService.read(accountId, resourceId),
      this.schemaService.readMergedSchema(accountId, 'PurchaseLine'),
    ])

    const typedBill = new TypedResource(billSchema, billResource)
      .setContact(fields.billingContact, billingContact)
      .setString(fields.invoiceNumber, invoiceNumber)
      .setDate(fields.invoiceDate, invoiceDate)
      .setString(fields.purchaseDescription, purchaseDescription)
      .setNumber(fields.paymentTerms, paymentTerms)

    if (vendorName) {
      const [vendor] = await this.resourceService.findResourcesByNameOrPoNumber(
        accountId,
        'Vendor',
        { input: vendorName },
      )
      if (vendor) {
        typedBill.setResource(fields.vendor, vendor.id)
      }
    }

    const vendor = typedBill.getResource(fields.vendor)
    if (poNumber && vendor) {
      const [purchase] = await this.resourceService.list(
        accountId,
        'Purchase',
        {
          where: {
            and: [
              { '==': [{ var: fields.poNumber.name }, poNumber] },
              { '==': [{ var: fields.vendor.name }, vendor.id] },
            ],
          },
        },
      )
      if (purchase) {
        typedBill.setResource(fields.purchase, purchase.id)
      }
    }

    await this.resourceService.update(accountId, resourceId, {
      fields: typedBill.updatedFields,
      costs: itemizedCosts,
    })
  }
}
