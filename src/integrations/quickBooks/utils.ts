export type RequestError = {
  response: {
    status: number
  }
}

export const isRequestError = (e: unknown): e is RequestError =>
  !!e &&
  typeof e === 'object' &&
  'response' in e &&
  !!e.response &&
  typeof e.response === 'object' &&
  'status' in e.response
