'use server'

import { RedirectType, redirect } from 'next/navigation'
import { z } from 'zod'
import { createSession } from '@/domain/iam/session/actions'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const handleLogin = async (state: unknown, formData: FormData) => {
  const { email, password } = await schema.parseAsync({
    email: formData.get('email')?.toString(),
    password: formData.get('password')?.toString(),
  })

  try {
    await createSession(email, password)

    redirect('/', RedirectType.replace)
  } catch {
    return { error: 'Incorrect email or password' }
  }
}
