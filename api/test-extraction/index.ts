import fs from 'fs/promises'
import { promisify } from 'util'
import { exec as execCallback } from 'child_process'
import { OpenAI } from 'openai'
import assert from 'assert'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'
import { z } from 'zod'
import { exit } from 'process'
import { P, match } from 'ts-pattern'

const exec = promisify(execCallback)

const convert = async () => {
  const fileNames = await fs.readdir(`${__dirname}/pdfs`)

  await Promise.all(
    fileNames.map((fileName) => {
      exec(
        `pdftoppm -png "${__dirname}/pdfs/${fileName}" "${__dirname}/pngs/${fileName.replace(
          '.pdf',
          ''
        )}"`
      )
    })
  )
}

const extract = async (pngPath: string) => {
  assert(pngPath.endsWith('.png'), 'Please provide a png path')

  // const file = await readFile(pngPath, { encoding: 'base64' })

  const client = new OpenAI({
    // These are required to use our specific model
    organization: 'org-u3vWSqIyPWvKu4xGpMEcH5l4',
    project: 'proj_RYX76NcxQN2NpLHkQuH7l33b',
  })

  const schema = z.object({
    wrapping: z.discriminatedUnion('type', [
      z.object({
        type: z.literal('image_url'),
        image_url: z.object({
          url: z.string(),
          detail: z.literal('auto'),
        }),
      }),
      z.object({
        type: z.literal('text'),
        text: z.string(),
      }),
    ]),
  })

  const completion = await client.beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: `
          Output "a", adhering to the provided format.
        `,
      },
      // {
      //   role: 'user',
      //   content: [{
      //     type: 'image_url',
      //     image_url: {
      //       url: `data:image/png;base64,${file}`,
      //       detail: 'auto',
      //     },
      //   }],
      // },
    ],
    response_format: zodResponseFormat(schema, 'response'),
  })

  const asshole = completion.choices[0]?.message.parsed ?? undefined

  console.log(asshole)
}

const args = process.argv.slice(2)

match(args)
  .with(['--convert'], () => convert())
  .with(['--extract', P.string], ([, fileName]) => extract(fileName))
  .otherwise(() => {
    console.error('Please provide a command')
    exit(1)
  })
