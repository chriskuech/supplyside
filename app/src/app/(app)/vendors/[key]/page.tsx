import { redirectToDrawer } from '@/lib/resource/redirectToDrawer'

export default async function VendorDetail({
  params: { key: rawKey },
}: {
  params: { key: string }
}) {
  await redirectToDrawer('Vendor', rawKey)
}
