import { match, P } from 'ts-pattern'

export function formatDate(
  date: Date | null | undefined,
): string | null | undefined {
  return match(date)
    .with(P.instanceOf(Date), (v) =>
      v.toLocaleDateString('en-US', {
        timeZone: 'UTC',
      }),
    )
    .otherwise((v) => v)
}

export function formatMoney(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
): string | null | undefined {
  return match(value)
    .with(P.number, (v) =>
      v.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        useGrouping: true,
        ...options,
      }),
    )
    .otherwise((v) => v)
}
