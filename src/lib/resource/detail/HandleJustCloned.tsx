'use client'

import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useEffect } from 'react'

export default function HandleJustCloned() {
  const { enqueueSnackbar } = useSnackbar()
  const { replace } = useRouter()

  const isCloned = new URL(location.href).searchParams.has('cloned')

  useEffect(() => {
    if (isCloned) {
      enqueueSnackbar('Resource cloned', { variant: 'success' })

      replace(location.pathname)
    }
  }, [enqueueSnackbar, isCloned, replace])

  return null
}
