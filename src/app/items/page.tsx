import ListPage from '@/lib/resource/ListPage'
import 'server-only'

export default async function Items() {
  return <ListPage tableKey="itemsList" resourceType="Item" path="/items" />
}
