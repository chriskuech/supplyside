import ListPage from '@/lib/resource/ListPage'

export default async function Orders() {
  return <ListPage tableKey="ordersList" resourceType="Order" path="/orders" />
}
