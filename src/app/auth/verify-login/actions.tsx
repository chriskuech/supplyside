'use server'

import { RedirectType, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSession } from '@/lib/session/actions'
import { SessionCreationError } from '@/domain/iam/session/errors'

type LoginParams = {
  email: string
  token: string
  rel?: string
}

export const login = async ({ email, token, rel = '/' }: LoginParams) => {
  try {
    await createSession(email, token)

    redirect(rel, RedirectType.replace)
  } catch (error) {
    if (error instanceof SessionCreationError) {
      return { error: error.message }
    }

    throw error
  }
}

export const refresh = async () => revalidatePath('')
