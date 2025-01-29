import 'server-only'
import { readSelf } from './client/user'
import { requireSession } from './session'
import { Session } from '@/session'

export const withGlobalAdmin =
  <Rest extends unknown[], Return>(fn: (...rest: Rest) => Promise<Return>) =>
  (...args: Rest): Promise<Return | undefined> =>
    requireSession()
      .then(({ userId }) => readSelf(userId))
      .then((user) => (user?.isGlobalAdmin ? fn(...args) : undefined))

export const withAccountId =
  <Rest extends unknown[], Return>(
    fn: (accountId: string, ...rest: Rest) => Promise<Return>,
  ) =>
  (...args: Rest): Promise<Return> =>
    requireSession().then(({ accountId }) => fn(accountId, ...args))

export const withSessionId =
  <Rest extends unknown[], Return>(
    fn: (sessionId: string, ...rest: Rest) => Promise<Return>,
  ) =>
  (...args: Rest): Promise<Return> =>
    requireSession().then(({ id }) => fn(id, ...args))

export const withSession =
  <Rest extends unknown[], Return>(
    fn: (session: Session, ...rest: Rest) => Promise<Return>,
  ) =>
  (...args: Rest): Promise<Return> =>
    requireSession().then((session) => fn(session, ...args))
