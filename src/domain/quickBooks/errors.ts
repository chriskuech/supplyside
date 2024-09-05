import { isMatching, P } from 'ts-pattern'
import { ExpectedError } from '../errors'

export const handleNotFoundError = (e: unknown, errorMessage: string) => {
  if (
    isMatching(
      {
        response: {
          data: { Fault: { Error: P.array({ Message: P.string }) } },
        },
      },
      e,
    )
  ) {
    if (
      e.response.data.Fault.Error.some(
        (error) => error.Message === 'Object Not Found',
      )
    ) {
      throw new ExpectedError(errorMessage)
    }
  }

  throw e
}
