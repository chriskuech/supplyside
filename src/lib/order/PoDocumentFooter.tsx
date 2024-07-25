'use server'

import { ReactNode } from 'react'
import { readResource } from '@/domain/resource/actions'

type Props = {
  accountId: string
  resourceId: string
}

export default async function PoDocumentFooter({
  accountId,
  resourceId,
}: Props): Promise<ReactNode> {
  const resource = await readResource({
    accountId,
    id: resourceId,
    type: 'Order',
  })

  const issuedDate =
    resource.fields.find((field) => field.fieldType === 'Date')?.value.date ??
    null

  const formattedDate = issuedDate
    ? new Date(issuedDate).toLocaleDateString()
    : 'N/A'

  return (
    <div
      style={{
        fontSize: '20px',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        gap: '40px',
      }}
    >
      <span style={{ paddingRight: '30px' }}>order-{resource.key} </span>
      <span>issued date - {formattedDate}</span>
    </div>
  )
}
