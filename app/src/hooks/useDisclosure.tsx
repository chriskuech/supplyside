import 'client-only'
import { useCallback, useState } from 'react'

export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((open) => !open)
  }, [])

  return { isOpen, open, close, toggle }
}
