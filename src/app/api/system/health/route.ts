'use server'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import build from './build.json'

const buildJsonSchema = z.object({
  commit: z.string().regex(/^[0-9a-f]{40}$/),
  version: z.coerce.number(),
  timestamp: z.string().datetime(),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    yourIp: req.ip,
    build: buildJsonSchema.passthrough().parse(build),
  })
}
