import { GridInitialState, useGridApiRef } from '@mui/x-data-grid-pro'
import { useCallback } from 'react'
import 'client-only'
import useLocalStorageState from '@/hooks/useLocalStorageState'

export const usePersistDatagridState = (storageKey: string | undefined) => {
  const apiRef = useGridApiRef()

  const [initialState, setInitialState] = useLocalStorageState<
    GridInitialState | undefined
  >(storageKey, undefined)

  const saveStateToLocalstorage = useCallback(() => {
    if (!storageKey) return

    const currentState = apiRef.current.exportState()
    setInitialState(currentState)
  }, [apiRef, storageKey, setInitialState])

  return {
    apiRef,
    initialState,
    saveStateToLocalstorage,
  }
}
