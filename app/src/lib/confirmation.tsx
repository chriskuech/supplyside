import { fail } from 'assert'
import {
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Dialog,
} from '@mui/material'

type ConfirmFn = (params: {
  title: string
  content: ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
}) => Promise<boolean>

type DialogState = {
  title: string
  content: ReactNode
  confirmButtonText: string
  cancelButtonText: string
  onConfirm: () => void
  onClose: () => void
}

const context = createContext<ConfirmFn | null>(null)

export const useConfirmation = () =>
  useContext(context) ?? fail('ConfirmationProvider not found')

export function ConfirmationProvider({ children }: PropsWithChildren) {
  const [params, setParams] = useState<DialogState | null>(null)

  const confirm = useCallback<ConfirmFn>(
    ({
      title,
      content,
      confirmButtonText = 'Confirm',
      cancelButtonText = 'Cancel',
    }) =>
      new Promise<boolean>((resolve) => {
        setParams({
          title,
          content,
          confirmButtonText,
          cancelButtonText,
          onConfirm: () => {
            setParams(null)
            resolve(true)
          },
          onClose: () => {
            setParams(null)
            resolve(false)
          },
        })
      }),
    [],
  )

  return (
    <context.Provider value={confirm}>
      {children}
      {params && (
        <Dialog open={true}>
          <DialogTitle>{params.title}</DialogTitle>
          <DialogContent>{params.content}</DialogContent>
          <DialogActions>
            <Button variant="text" onClick={params.onClose}>
              {params.cancelButtonText}
            </Button>
            <Button onClick={params.onConfirm}>
              {params.confirmButtonText}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </context.Provider>
  )
}
