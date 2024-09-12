'use server'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import build from './build.json'

const buildJsonSchema = z.object({
  commit: z.string().regex(/^[0-9a-f]{40}$/),
  version: z.coerce.number(),
  timestamp: z.string().datetime(),
})

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    build: buildJsonSchema.passthrough().parse(build),
  })
}
