import { isMatching, P } from 'ts-pattern'

export type RequestError = {
  response: {
    status: number
  }
}

export const isRequestError = isMatching({ response: {status: P.number } })
