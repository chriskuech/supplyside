const isSeeding = process.argv.some((arg) =>
  arg.endsWith('/prisma/seed/main.ts'),
)

if (!isSeeding) {
  throw new Error('This file should not be imported in the browser')
}
