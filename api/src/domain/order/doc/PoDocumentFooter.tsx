import { ReactNode } from 'react'
import { OrderViewModel } from './ViewModel'

export default function PoDocumentFooter({
  number,
  issuedDate,
}: OrderViewModel): ReactNode {
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
        <span>Order #{number}</span>
        <span style={{ margin: '0px 5px' }}>|</span>
        <span>{issuedDate ?? 'N/A'}</span>
      </div>

      <div>
        Page <span className="pageNumber" /> of <span className="totalPages" />
      </div>
    </div>
  )
}
