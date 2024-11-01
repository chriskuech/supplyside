import { GridInitialState, useGridApiRef } from '@mui/x-data-grid-pro'
import { useCallback, useLayoutEffect } from 'react'
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

  useLayoutEffect(() => {
    if (!initialState) {
      setInitialState({})
    }
  }, [initialState, setInitialState])

  return {
    apiRef,
    initialState,
    saveStateToLocalstorage,
  }
}
