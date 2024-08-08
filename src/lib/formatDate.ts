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
