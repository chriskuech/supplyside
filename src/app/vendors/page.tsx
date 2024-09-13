import ListPage from '@/lib/resource/ListPage'
import 'server-only'

export default async function Vendors() {
  return (
    <ListPage tableKey="vendorsList" resourceType="Vendor" path="/vendors" />
  )
}
