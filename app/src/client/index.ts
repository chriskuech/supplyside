import 'server-only'
import createClient from 'openapi-fetch'
import type { paths } from '@supplyside/api'
import { config } from '@/config'

export const client = () => {
  const { API_BASE_URL, API_KEY } = config()

  const headers = new Headers()
  headers.append('Authorization', `Bearer ${API_KEY}`)

  return createClient<paths>({
    baseUrl: API_BASE_URL,
    headers,
  })
}
