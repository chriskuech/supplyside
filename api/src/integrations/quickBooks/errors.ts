import { isMatching, P } from 'ts-pattern'
import { NotFoundError } from '../fastify/NotFoundError'
import { NOT_FOUND_CODE } from './constants'

const errorResponsePattern = {
  response: {
    data: { Fault: { Error: P.array({ code: P.string }) } },
  },
}

export const handleNotFoundError = (e: unknown, errorMessage: string) => {
  if (isMatching(errorResponsePattern, e)) {
    const errors = e.response.data.Fault.Error
    if (errors.some((error) => error.code === NOT_FOUND_CODE)) {
      throw new NotFoundError(errorMessage)
    }
  }

  throw e
}
