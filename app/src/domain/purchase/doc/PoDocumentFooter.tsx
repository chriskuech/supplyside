import { ReactNode } from 'react'

interface PoDocumentFooterProps {
  number: string | null
  issuedDate: string | null
}

export default function PoDocumentFooter({
  number,
  issuedDate,
}: PoDocumentFooterProps): ReactNode {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0px 20px',
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
      }}
    >
      <div style={{}}>
        <span>Purchase #{number}</span>
        <span style={{ margin: '0px 5px' }}>|</span>
        <span>{issuedDate ?? 'N/A'}</span>
      </div>

      <div className="page-counter" />
    </div>
  )
}
