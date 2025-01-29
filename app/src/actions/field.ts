'use server'

import * as client from '@/client/field'
import { withAccountId } from '@/authz'

export const createField = withAccountId(client.createField)
export const updateField = withAccountId(client.updateField)
export const readFields = withAccountId(client.readFields)
export const deleteField = withAccountId(client.deleteField)
