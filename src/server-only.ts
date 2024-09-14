if (!process.argv.some((arg) => arg.endsWith('/prisma/seed/main.ts'))) {
  throw new Error('This file should not be imported in the browser')
}
