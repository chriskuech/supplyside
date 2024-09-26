import { Container } from 'inversify'

export const createContainer = () => {
  const container = new Container({
    skipBaseClassChecks: true, // I think it is trying to DI base class arguments
    autoBindInjectable: true, // This lets you automatically inject classes without binding here
    defaultScope: 'Singleton',
  })

  // add more complex bindings here

  return container
}

export const container = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = global as any

  if (!g.diContainer) {
    g.diContainer = createContainer()
  }

  return g.diContainer as Container
}
