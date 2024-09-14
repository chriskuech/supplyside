import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import build from './build.json'
import '@/server-only'

const buildJsonSchema = z.object({
  commit: z.string().regex(/^[0-9a-f]{40}$/),
  version: z.coerce.number(),
  timestamp: z.string().datetime(),
})

export async function GET(): Promise<NextResponse> {
  cookies() // TODO: this just forces it to be dynamic (?)

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    build: buildJsonSchema.passthrough().parse(build),
  })
}
