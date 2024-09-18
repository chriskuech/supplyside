'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useEffect } from 'react'

export default function HandleJustCloned() {
  const { enqueueSnackbar } = useSnackbar()
  const { replace } = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.has('cloned')) {
      enqueueSnackbar('Resource cloned', { variant: 'success' })

      replace(location.pathname)
    }
  }, [enqueueSnackbar, replace, searchParams])

  return null
}
