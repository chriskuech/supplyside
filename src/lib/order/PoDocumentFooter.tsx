'use server'

import { ReactNode } from 'react'
import { readResource } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'

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

  const issuedDate = resource.fields.find(
    (f) => f.templateId === fields.issuedDate.templateId,
  )?.value.date

  const formattedDate = issuedDate
    ? new Date(issuedDate).toLocaleDateString()
    : 'N/A'

  return (
    <div
      style={{
        fontSize: '16px',
        textAlign: 'center',
        padding: '25px',
        backgroundColor: '#f0f0f0',
        width: '100%',
        fontWeight: 'normal',
      }}
    >
      <p style={{ float: 'left' }}>
        <span style={{ paddingRight: '30px' }}>order-{resource.key} </span>
        <span>issued date - {formattedDate}</span>
      </p>

      <p style={{ float: 'right', textAlign: 'right' }}>
        {' '}
        Page <span className="pageNumber"></span> of{' '}
        <span className="totalPages"></span>
      </p>
    </div>
  )
}
