import ListPage from '@/lib/resource/ListPage'

export default async function Vendors() {
  return <ListPage tableKey="vendorsList" resourceType={'Vendor'} />
}
