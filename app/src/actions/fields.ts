import * as client from '@/client/fields'
import { withAccountId } from '@/authz'

export const createField = withAccountId(client.createField)
export const updateField = withAccountId(client.updateField)
export const readFields = withAccountId(client.readFields)
export const deleteField = withAccountId(client.deleteField)
