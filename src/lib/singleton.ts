/**
 * Ensures
 *   - that no code runs at build time (via module import)
 *   - that clients are not reinstantiated from hot reloads in local dev
 * @param fn
 * @returns
 */
const singleton = <T>(fn: () => T): (() => T) => {
  const key = new URL(import.meta.url).pathname

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gany = global as any

  return () => {
    if (!(key in gany)) {
      gany[key] = fn()
    }

    return gany[key]
  }
}

export default singleton
