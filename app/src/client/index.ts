import 'server-only'
import createClient from 'openapi-fetch'
import type { paths } from '@supplyside/api'
import { config } from '@/config'

// shim until react cache is released
const cache = <T>(fn: () => T): (() => T) => {
  let value: T
  return () => {
    value ??= fn()
    return value
  }
}

export const client = cache(() => {
  const { API_BASE_URL, API_KEY } = config()

  return createClient<paths>({
    baseUrl: API_BASE_URL,
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
})
