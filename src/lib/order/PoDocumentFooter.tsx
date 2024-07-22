'use server'

type Props = {
  accountId: string
  resourceId: string
}

export default async function PoDocumentFooter(props: Props) {
  return (
    <div style={{ fontSize: '30px' }}>
      Purchase Order Footer!
      <br />
      {JSON.stringify(props, null, 4)}
    </div>
  )
}
