import { useState } from 'react'

export default function useAccordion(defaultExpanded: number[] = []) {
  const [expanded, setExpanded] = useState<number[]>(defaultExpanded)

  const isExpanded = (i: number) => expanded.includes(i)
  const open = (i: number) => setExpanded([...expanded, i])
  const close = (i: number) => setExpanded(expanded.filter((e) => e !== i))
  const toggle = (i: number) => (isExpanded(i) ? close(i) : open(i))

  return { isExpanded, toggle }
}
