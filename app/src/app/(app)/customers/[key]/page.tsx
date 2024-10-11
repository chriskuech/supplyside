import { redirectToDrawer } from '@/lib/resource/redirectToDrawer'

export default async function CustomersDetail({
  params: { key: rawKey },
}: {
  params: { key: string }
}) {
  await redirectToDrawer('Customer', rawKey)
}
