import { useLayoutEffect, useState } from 'react'

export const useResizeObserver = (ref: React.RefObject<Element>) => {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    if (!ref.current) return

    const observer = new ResizeObserver(([entry]) => {
      setBox(entry?.contentRect ?? null)
    })

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref])

  return box
}
