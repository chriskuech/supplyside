export class ExpectedError extends Error {}

export const handleExpectedErrors =
  <K, T>(fn: (params: K) => Promise<T>) =>
  (params: K) =>
    fn(params).catch((e) => {
      if (e instanceof ExpectedError) {
        return { error: true, message: e.message }
      }

      throw e
    })
