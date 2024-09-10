export class ExpectedError extends Error {}

export const handleExpectedErrors =
  <K>(fn: (params: K) => Promise<unknown>) =>
  (params: K) =>
    fn(params).catch((e) => {
      if (e instanceof ExpectedError) {
        return { error: true, message: e.message }
      }

      throw e
    })
