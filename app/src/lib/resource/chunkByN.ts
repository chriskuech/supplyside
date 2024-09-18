import { ok } from 'assert'
import { range } from 'remeda'

/**
 * Breaks up an array into n smaller arrays such
 *  - the last arrays have m elements
 *  - the first arrays have m+1 elements
 *  - the order of elements is preserved
 * @param arr the array to break up into chunks
 * @param n the number of chunks to break the array into
 * @returns an array of arrays with the elements of the original array
 */
export const chunkByN = <T>(arr: T[], n: number): T[][] => {
  ok(n > 0)
  const m = Math.floor(arr.length / n)
  const r = arr.length % n
  return range(0, n).map((i) =>
    arr.slice(i * m + Math.min(i, r), (i + 1) * m + Math.min(i + 1, r)),
  )
}
