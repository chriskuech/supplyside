import { match, P } from 'ts-pattern'

export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string | null | undefined {
  return match(date)
    .with(P.string, (s) => formatDate(new Date(s)))
    .with(P.instanceOf(Date), (d) =>
      d.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        ...options,
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
