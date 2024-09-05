import ListPage from '@/lib/resource/ListPage'

export default async function Items() {
  return <ListPage tableKey="itemsList" resourceType="Item" path="/items" />
}
