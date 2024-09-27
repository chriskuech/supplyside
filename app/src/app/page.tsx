import { redirect } from 'next/navigation'
import type { AppRouter } from '@api/trpc'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import { systemAccountId } from '@/lib/const'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

export default async function Home() {
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000',
      }),
    ],
  });

  const { accountId } = await requireSessionWithRedirect('/')

  redirect(accountId === systemAccountId ? '/accounts' : '/purchases')
}
