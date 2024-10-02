'use server'

import { withAccountId, withGlobalAdmin } from '@/authz'
import * as client from '@/client/account'

export const createAccount = withGlobalAdmin(client.createAccount)
export const updateAccountAsAdmin = withGlobalAdmin(client.updateAccount)
export const updateAccountAsUser = withAccountId(client.updateAccount)
export const deleteAccount = withGlobalAdmin(client.deleteAccount)
export const applyTemplateAsAdmin = withGlobalAdmin(client.applyTemplate)
export const applyTemplateAsUser = withAccountId(client.applyTemplate)
