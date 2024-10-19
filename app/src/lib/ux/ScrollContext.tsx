'use client'

import { Box } from '@mui/material'
import {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
  FC,
} from 'react'

const ScrollContext = createContext(0)

export const ScrollProvider: FC<PropsWithChildren> = ({ children }) => {
  const [scrollTop, setScrollTop] = useState(0)

  return (
    <ScrollContext.Provider value={scrollTop}>
      <Box
        width="100%"
        height="100%"
        overflow="auto"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        {children}
      </Box>
    </ScrollContext.Provider>
  )
}

export const useScrollContext = () => useContext(ScrollContext)
