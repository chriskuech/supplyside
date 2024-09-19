export class DuplicateResourceError extends Error {
  constructor(name: string) {
    super(`A resource with name: ${name} already exists.`)
  }
}
