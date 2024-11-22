'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileDrawerContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const MobileDrawerContext = createContext<MobileDrawerContextType | undefined>(
  undefined,
)

export function MobileDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MobileDrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileDrawerContext.Provider>
  )
}

export function useMobileDrawer() {
  const context = useContext(MobileDrawerContext)
  if (context === undefined) {
    throw new Error(
      'useMobileDrawer must be used within a MobileDrawerProvider',
    )
  }

  return context
}
