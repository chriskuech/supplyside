import { GridColumnOrderChangeParams, GridColumnResizeParams, GridColumnVisibilityModel, GridInitialState, useGridApiRef } from '@mui/x-data-grid-pro';
import React, { useCallback, useLayoutEffect, useState } from 'react'

export const usePersistDatagridState = (storageKey: string) => {
  const apiRef = useGridApiRef();

  const [initialState, setInitialState] = useState<GridInitialState>();

  const saveStateToLocalstorage = useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      localStorage.setItem(storageKey, JSON.stringify(currentState));
    }
  }, [apiRef]);

  const onColumnVisibilityModelChange = (params: GridColumnVisibilityModel) => {
    saveStateToLocalstorage();
  }

  const onColumnWidthChange = (params: GridColumnResizeParams) => {
    saveStateToLocalstorage();
  }

  const onColumnOrderChange = (params: GridColumnOrderChangeParams) => {
    saveStateToLocalstorage();
  }

  useLayoutEffect(() => {
    const stateFromLocalStorage = localStorage?.getItem(storageKey);
    setInitialState(stateFromLocalStorage ? JSON.parse(stateFromLocalStorage) : {});

    // // handle refresh and navigating away/refreshing
    // window.addEventListener('beforeunload', saveStateToLocalstorage);

    // return () => {
    //   // // in case of an SPA remove the event-listener
    //   // window.removeEventListener('beforeunload', saveStateToLocalstorage);
    //   // saveStateToLocalstorage();
    // };
  }, [saveStateToLocalstorage]);

  // useEffect(() => {
  //   if (apiRef?.current?.subscribeEvent) {
  //     console.log('asd')
  //     return apiRef.current.subscribeEvent('columnHeaderDragEnd', (params) => {
  //       console.log('order params', params)
  //     })
  //   }
  // }, [apiRef])

  return {
    apiRef,
    initialState,
    saveStateToLocalstorage,
    // onColumnVisibilityModelChange,
    // onColumnWidthChange,
    // onColumnOrderChange,
  }
};
