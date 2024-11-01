import { GridInitialState, useGridApiRef } from '@mui/x-data-grid-pro'
import { useCallback, useLayoutEffect, useState } from 'react'
import 'client-only'

export const usePersistDatagridState = (storageKey: string | undefined) => {
  const apiRef = useGridApiRef()

  const [initialState, setInitialState] = useState<GridInitialState>()

  const saveStateToLocalstorage = useCallback(() => {
    if (!storageKey) return

    const currentState = apiRef.current.exportState()
    localStorage.setItem(storageKey, JSON.stringify(currentState))
  }, [apiRef, storageKey])

  useLayoutEffect(() => {
    if (!storageKey) return

    const stateFromLocalStorage = localStorage.getItem(storageKey)
    setInitialState(
      stateFromLocalStorage ? JSON.parse(stateFromLocalStorage) : {},
    )
  }, [saveStateToLocalstorage, storageKey])

  return {
    apiRef,
    initialState,
    saveStateToLocalstorage,
  }
}
