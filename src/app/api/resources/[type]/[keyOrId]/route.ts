import { NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import { keyOrIdSchema, resourceTypeSchema } from '../../lib'
import { deleteResource, readResource } from '@/domain/resource'
import { readSession } from '@/lib/session/actions'
import { SessionError } from '@/lib/session/types'

const paramsSchema = z.object({
  params: z.object({
    type: resourceTypeSchema,
    keyOrId: keyOrIdSchema,
  }),
})

export async function GET(params: unknown) {
  try {
    const { accountId } = await readSession()

    const {
      params: { type, keyOrId },
    } = paramsSchema.parse(params)

    const resource = await readResource({ accountId, type, ...keyOrId })

    return NextResponse.json(resource, { status: 200 })
  } catch (error) {
    if (error instanceof SessionError) {
      return NextResponse.json(
        {
          error: 'Invalid session',
        },
        { status: 401 },
      )
    }

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

export async function PATCH(params: unknown) {
  return new NextResponse('Hello, world!')
}

export async function PUT(params: unknown) {
  return new NextResponse('Hello, world!')
}

export async function DELETE(params: unknown) {
  try {
    const { accountId } = await readSession()

    const {
      params: { type, keyOrId },
    } = paramsSchema.parse(params)

    const resource = await deleteResource({ accountId, type, ...keyOrId })

    return NextResponse.json(resource, { status: 200 })
  } catch (error) {
    if (error instanceof SessionError) {
      return NextResponse.json(
        {
          error: 'Invalid session',
        },
        { status: 401 },
      )
    }

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
