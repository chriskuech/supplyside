import { useEffect } from 'react'

export const useEventListener = <K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
) => {
  useEffect(() => {
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [eventName, handler])
}
