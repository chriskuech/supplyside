'use server'

import { ReactNode } from 'react'
import { readResource } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'
import { selectValue } from '@/domain/resource/types'

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

  const issuedDate = selectValue(resource, fields.issuedDate)?.date

  const formattedDate = issuedDate
    ? new Date(issuedDate).toLocaleDateString()
    : 'N/A'

  return (
    <div
      style={{
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        padding: '0 30px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ flexGrow: 1 }}>
        <span>Order #{resource.key} </span>
        <span style={{ margin: '0px 5px' }}>| </span>
        {formattedDate}
      </div>

      <div>
        Page <span className="pageNumber"></span> of{' '}
        <span className="totalPages"></span>
      </div>
    </div>
  )
}
