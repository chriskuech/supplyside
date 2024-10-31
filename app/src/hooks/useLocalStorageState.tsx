import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

export default function useLocalStorageState<T>(
  key: string | undefined,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  // Using ref to prevent defaultValue to be stored on local storage
  const isMounted = useRef(false)
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    if (key) {
      const item = window.localStorage.getItem(key)
      if (item) {
        setValue(JSON.parse(item))
      }
    }

    return () => {
      isMounted.current = false
    }
  }, [key])

  useEffect(() => {
    if (isMounted.current) {
      if (key) {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } else {
      isMounted.current = true
    }
  }, [key, value])

  return [value, setValue]
}
