import 'server-only'
import createClient from 'openapi-fetch'
import type { paths } from '@supplyside/api'

export const client = createClient<paths>({ baseUrl: 'http://localhost:8080/' })
