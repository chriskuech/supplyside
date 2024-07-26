import assert from 'assert'
import { isTruthy } from 'remeda'
import prisma from '../prisma'
import { readBlob } from '@/domain/blobs/actions'
import { readSchema } from '@/domain/schema/actions'
import { mapSchemaToJsonSchema } from '@/domain/schema/json-schema/actions'
import openai from '@/lib/openai'

export const extractContent = async (accountId: string) => {
  const schema = await readSchema({ accountId, resourceType: 'Bill' })

  const functionName = 'extract_bill_content'

  const files = await prisma().file.findMany({
    where: { accountId },
    include: { Blob: true },
  })

  const urls = await Promise.all(
    files
      .filter((f) =>
        [
          'image/png',
          'image/jpeg',
          'image/webp',
          // TODO: convert these to png/webp prior to sending to OpenAI
          // 'application/pdf',
          // 'text/plain',
          // 'text/html',
        ].includes(f.Blob.mimeType),
      )
      .map(async (f) => {
        const blob = await readBlob({ accountId, blobId: f.Blob.id })

        if (!blob) return

        return `data:${f.Blob.mimeType};base64,${blob.buffer.toString('base64')}`
      }),
  )

  const response = await openai().chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a content extraction tool for a business critical application. Extremely carefully extract the information from the images into the structured format defined by the function.',
      },
      {
        role: 'user',
        content: urls.filter(isTruthy).map((url) => ({
          type: 'image_url',
          image_url: { url, detail: 'high' },
        })),
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: functionName,
          description:
            'Receives the extracted content Bill/Invoice data from the images.',
          parameters: mapSchemaToJsonSchema(schema),
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: functionName } },
    response_format: { type: 'json_object' },
    model: 'gpt-4o', //gpt-4o, gpt-4o-mini or gpt-4-turbo to understand images.
    temperature: 0, // max deterministic
    top_p: 0.1, // top 10% of best tokens
  })

  const calls = response.choices[0].message.tool_calls

  assert(calls?.length === 1)

  const [{ function: fn }] = calls

  assert(fn.name === functionName)

  return JSON.parse(fn.arguments)
}
