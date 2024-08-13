import { useCallback, useEffect } from 'react'
import { Options, useAsyncCallback, UseAsyncState } from './useAsyncCallback'

type Props<Args extends unknown[], ResolvedType> = {
  deps: Args
  fn: (deps: Args) => Promise<ResolvedType>
}
export function useAsyncQuery<const Args extends unknown[], ResolvedType>(
  { fn, deps }: Props<Args, ResolvedType>,
  { showGenericError }: Options = { showGenericError: true },
): UseAsyncState<ResolvedType> & { refetch: () => Promise<ResolvedType> } {
  const [status, triggerCallback] = useAsyncCallback(fn, {
    showGenericError,
  })

  const memoizedCallback = useCallback(() => triggerCallback(deps), deps)

  useEffect(() => {
    memoizedCallback()
  }, [memoizedCallback])

  return { ...status, refetch: memoizedCallback }
}
