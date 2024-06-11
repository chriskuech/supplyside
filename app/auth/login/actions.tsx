'use server'

import { RedirectType, redirect } from 'next/navigation'
import { z } from 'zod'
import { createSession } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const handleLogin = async (state: unknown, formData: FormData) => {
  const { email, password } = await schema.parseAsync({
    email: formData.get('email')?.toString(),
    password: formData.get('password')?.toString(),
  })

  const session = await createSession(email, password)

  if (!session) return { error: 'Incorrect email or password' }

  redirect('/', RedirectType.replace)
}
