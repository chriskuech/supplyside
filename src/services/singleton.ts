import 'server-only'

/**
 * Ensures that--
 *   - no code runs at build time (via module import)
 *   - clients are not reinstantiated from hot reloads in local dev
 * @param fn - the function that creates the singleton instance. It receives a `clear` function that can be called to clear the singleton instance.
 * @returns the singleton instance
 */
const singleton = <T>(key: string, fn: (clear: () => void) => T): (() => T) => {
  const nsKey = `__singleton__${key}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gany = global as any

  return () => {
    if (!gany[nsKey]) {
      gany[nsKey] = fn(() => (gany[nsKey] = undefined))
    }

    return gany[nsKey]
  }
}

export default singleton
