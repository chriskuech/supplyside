'use client'

import { useEffect } from 'react'
import { refresh } from './actions'

export default function RefreshOnFocus() {
  useEffect(() => {
    const handleFocus = () => refresh()

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return null
}
