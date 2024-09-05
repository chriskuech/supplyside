import { NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import { resourceTypeSchema } from '../lib'
import { createResource, readResources } from '@/domain/resource'
import { readSession } from '@/lib/session/actions'

const paramsSchema = z.object({
  params: z.object({
    type: resourceTypeSchema,
  }),
})

export async function GET(params: unknown) {
  try {
    const { accountId } = await readSession()

    const {
      params: { type },
    } = paramsSchema.parse(params)

    const resources = await readResources({
      accountId,
      type,
    })

    return NextResponse.json(resources, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: error.message,
        },
        { status: 400 },
      )
    }

    throw error
  }
}

export async function POST(params: unknown) {
  try {
    const { accountId } = await readSession()

    const {
      params: { type },
    } = paramsSchema.parse(params)

    const resource = await createResource({
      accountId,
      type,
      fields: [],
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: error.message,
        },
        { status: 400 },
      )
    }

    throw error
  }
}
