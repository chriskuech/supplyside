'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import ConfirmationDialog from './ConfirmationDialog'

type ConfirmationOptions = {
  title: string
  content: React.ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
}

type ConfirmationContextType = {
  confirm: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(
  undefined,
)

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null)

  const confirm = useCallback(
    (options: ConfirmationOptions): Promise<boolean> =>
      new Promise<boolean>((resolve) => {
        setOptions(options)
        setIsOpen(true)
        setResolvePromise(() => resolve)
      }),
    [],
  )

  const handleConfirm = useCallback(() => {
    if (resolvePromise) resolvePromise(true)
    setIsOpen(false)
  }, [resolvePromise])

  const handleClose = useCallback(() => {
    if (resolvePromise) resolvePromise(false)
    setIsOpen(false)
  }, [resolvePromise])

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <ConfirmationDialog
          isOpen={isOpen}
          title={options.title}
          content={options.content}
          confirmButtonText={options.confirmButtonText}
          cancelButtonText={options.cancelButtonText}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      )}
    </ConfirmationContext.Provider>
  )
}

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error(
      'useConfirmation must be used within a ConfirmationProvider',
    )
  }

  return context.confirm
}
