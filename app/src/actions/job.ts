'use server'

import { withAccountId } from '@/authz'
import * as client from '@/client/job'

export const syncFromAttachments = withAccountId(client.syncFromAttachments)
