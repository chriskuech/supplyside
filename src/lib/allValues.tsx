'use server'

export const allValues = async <
  T extends Readonly<Record<string, unknown>>,
>(promises: {
  [K in keyof T]: Promise<T[K]> | T[K]
}): Promise<T> =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(promises).map(async ([key, value]) => [key, await value]),
    ),
  ) as T
