import { useCallback, useEffect } from 'react'
import { Options, useAsyncCallback, UseAsyncState } from './useAsyncCallback'
import 'client-only'

type Props<Args extends unknown[], ResolvedType> = {
  deps: Args
  fn: (...deps: Args) => Promise<ResolvedType>
}
export function useAsyncQuery<const Args extends unknown[], ResolvedType>(
  { fn, deps }: Props<Args, ResolvedType>,
  { showGenericError }: Options = { showGenericError: true },
): UseAsyncState<ResolvedType> & {
  refetch: () => Promise<ResolvedType | undefined>
} {
  const [status, triggerCallback] = useAsyncCallback(fn, {
    showGenericError,
  })

  const memoizedCallback = useCallback(
    () => triggerCallback(...deps),
    [deps, triggerCallback],
  )

  useEffect(() => {
    memoizedCallback()
  }, [memoizedCallback])

  return { ...status, refetch: memoizedCallback }
}
