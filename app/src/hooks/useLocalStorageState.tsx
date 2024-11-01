import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

export default function useLocalStorageState<T>(
  key: string | undefined,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  // Using ref to prevent defaultValue to be stored on local storage
  const isMounted = useRef(false)
  const [value, setValue] = useState<T>(() => {
    const item = key && window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  })

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
