import ListPage from '@/lib/resource/ListPage'
import '@/server-only'

export default async function Orders() {
  return <ListPage tableKey="ordersList" resourceType="Order" path="/orders" />
}
