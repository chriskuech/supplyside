import ListPage from '@/lib/resource/ListPage'

export default async function Bills() {
  return <ListPage tableKey="billsList" resourceType={'Bill'} />
}
