import ListPage from '@/lib/resource/ListPage'

export default async function Customers() {
  return (
    <ListPage
      tableKey="customersList"
      resourceType="Customer"
      path="/customers"
    />
  )
}
