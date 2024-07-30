'use server'

import { ReactNode } from 'react'
import { styles } from './PoDocumentStyles'
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
    <div style={styles.FooterClass}>
      <div style={{ paddingRight: '30px', flex: 1 }}>
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
