'use server'

import { withAccountId } from '@/authz'
import * as client from '@/client/schema'

export const readSchema = withAccountId(client.readSchema)
export const readSchemas = withAccountId(client.readCustomSchemas)
export const addSection = withAccountId(client.addSection)
export const updateSection = withAccountId(client.updateSection)
export const removeSection = withAccountId(client.removeSection)
export const updateSchema = withAccountId(client.updateSchema)
