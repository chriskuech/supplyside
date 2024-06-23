'use server'

import { ReactNode } from 'react'

export default async function PoDocumentFooter(): Promise<ReactNode> {
  return <div style={{ fontSize: '30px' }}>Purchase Order Footer!</div>
}
