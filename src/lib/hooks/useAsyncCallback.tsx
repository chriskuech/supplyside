import { useSnackbar } from 'notistack'
import { useCallback, useState } from 'react'

export type UseAsyncState<T> = {
  data: T | undefined
  error: boolean
  isSuccess: boolean
  isLoading: boolean
}

type Options = {
  showGenericError: boolean
}

// TODO: Consider: looking at the major utility hook libraries. check how to integrate with nextJS as it already handles caching
export function useAsyncCallback<Args extends unknown[], ResolvedType>(
  callback: (...args: Args) => Promise<ResolvedType>,
  { showGenericError }: Options = { showGenericError: true },
): [UseAsyncState<ResolvedType>, (...args: Args) => Promise<ResolvedType>] {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [data, setData] = useState<ResolvedType>()
  const { enqueueSnackbar } = useSnackbar()

  const _callback = useCallback(
    async (...args: Args) => {
      try {
        setIsLoading(true)
        const result = await callback(...args)
        setData(result)
        setIsSuccess(true)

        return result
      } catch (e) {
        setError(true)
        if (showGenericError) {
          enqueueSnackbar('Something went wrong, please try again later', {
            variant: 'error',
          })
        }

        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [callback, enqueueSnackbar, showGenericError],
  )

  return [{ data, error, isLoading, isSuccess }, _callback]
}
