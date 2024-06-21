/**
 * Mitigate local dev hot reload not cleaning up connections
 * @param key the cache key, explicitly defined to remain constant across process restarts
 * @param factory the factory function to create the object
 * @returns the object
 */
export const lazyStatic = <T>(key: symbol, factory: () => T): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gbl = global as any

  if (!gbl[key]) {
    gbl[key] = factory()
  }

  return gbl[key] as T
}
