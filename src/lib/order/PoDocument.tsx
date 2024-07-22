/* eslint-disable @next/next/no-head-element */
'use server'

import { ReactNode } from 'react'

type Props = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

export default async function PoDocument(props: Props): Promise<ReactNode> {
  return (
    <div>
      Purchase Order!
      <br />
      {JSON.stringify(props, null, 4)}
    </div>
  )
}
