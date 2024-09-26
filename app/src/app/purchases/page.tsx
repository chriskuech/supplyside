import ListPage from '@/lib/resource/ListPage'

export default async function Purchases() {
  return (
    <ListPage
      tableKey="purchasesList"
      resourceType="Purchase"
      path="/purchases"
    />
  )
}
