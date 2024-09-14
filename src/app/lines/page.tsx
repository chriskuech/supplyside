import ListPage from '@/lib/resource/ListPage'
import '@/server-only'

export default async function Lines() {
  return <ListPage tableKey="linesList" resourceType="Line" path="/lines" />
}
