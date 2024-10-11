import { redirectToDrawer } from '@/lib/resource/redirectToDrawer'

export default async function ItemsDetail({
  params: { key: rawKey },
}: {
  params: { key: string }
}) {
  await redirectToDrawer('Item', rawKey)
}
