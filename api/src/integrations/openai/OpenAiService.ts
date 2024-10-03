import { inject, injectable } from 'inversify'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'
import { CompletionPartsService } from './CompletionPartsService'
import { File } from '@supplyside/model'
import { ZodSchema } from 'zod'
import { P, match } from 'ts-pattern'
import { ChatCompletionContentPart } from 'openai/resources/index.mjs'

@injectable()
export class OpenAiService {
  private readonly client: OpenAI

  constructor(
    @inject(CompletionPartsService)
    private readonly completionPartsService: CompletionPartsService
  ) {
    this.client = new OpenAI({
      // These are required to use our specific model
      organization: 'org-u3vWSqIyPWvKu4xGpMEcH5l4',
      project: 'proj_RYX76NcxQN2NpLHkQuH7l33b',
    })
  }

  async extractContent<T>(params: {
    systemPrompt: string;
    files: (File | string)[];
    schema: ZodSchema<T>;
  }): Promise<T | undefined> {
    const completionParts = (
      await Promise.all(
        params.files.map((file) =>
          match(file)
            .with(P.string, (text) => ({ type: 'text', text } satisfies ChatCompletionContentPart))
            .otherwise((file) =>
              this.completionPartsService.mapFileToCompletionParts(file)
            )
        )
      )
    ).flat()

    if (!completionParts.length) return undefined

    const completion = await this.client.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: params.systemPrompt,
        },
        {
          role: 'user',
          content: completionParts,
        },
      ],
      response_format: zodResponseFormat(params.schema, 'extractedContent'),
    })

    return completion.choices[0]?.message.parsed ?? undefined
  }
}
