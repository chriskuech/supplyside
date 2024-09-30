'use server'

import { fail } from 'assert'

export const createPo = async (resourceId: string) => {}

export const sendPo = async (resourceId: string) => {}

export const renderPo = async (params: {
  accountId: string
  resourceId: string
  isPreview?: boolean
}): Promise<Buffer> => fail('NYI')
