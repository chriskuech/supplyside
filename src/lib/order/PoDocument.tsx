/* eslint-disable @next/next/no-head-element */
'use server'

import { ReactNode } from 'react'
import { readResource } from '@/domain/resource/actions'
import { Resource } from '@/domain/resource/types'

type Props = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

export default async function PoDocument({
  accountId,
  resourceId,
}: Props): Promise<ReactNode> {
  const resource = (await readResource({
    accountId: accountId,
    id: resourceId,
    type: 'Order',
  })) as Resource

  const issuedDateField = resource.fields.find(
    (field) => field.fieldType === 'Date' && field.value.date,
  )

  const issuedDate = issuedDateField ? issuedDateField.value.date : null
  let formattedDate = 'N/A'
  if (issuedDate) {
    formattedDate = new Date(issuedDate).toLocaleDateString()
  }

  return (
    <div>
      <html>
        <head>
          <style>
            {`
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              .header, .section {
                width: 100%;
                margin-bottom: 30px;
              }
              .header {
                text-align: center;
                padding: 20px;
                overflow: hidden;
              }
              .content {
                padding: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
              }
              th, td {
                  border: 1px solid black;
                  padding: 8px;
                  text-align: left;
              }
              .terms-conditions {
                page-break-before: always;
               }
              .notes, .payment-terms, .vendor, .shipping, .items {
                margin-bottom: 20px;
              }
              .notes, .payment-terms, .vendor, .shipping {
                width: 48%;
                display: inline-block;
                vertical-align: top;
              }
              .notes {
                width: 100%;
              }
              .items {
                width: 100%;
              }
              .terms-conditions, .reference-number {
                  margin: 20px 0;
                  padding: 10px; 
                  border-radius: 4px; 
              }

              .terms-conditions table, .reference-number table {
                  width: 100%; 
                  border-collapse: collapse;
              }

              .terms-conditions th, .reference-number th {
                  padding: 10px; 
                  background-color: #CCCCCC;
              }

              .terms-conditions td, .reference-number td {
                  padding: 8px;
              }
              .terms-conditions td {
                min-height: 200px; 
                line-height: 36px;
              }
              .reference-number td {
                min-height: 200px; 
                line-height: 36px;
              }
            `}
          </style>
        </head>
        <body>
          <div className="header1" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                width: '28%',
              }}
            >
              <strong>LOGO</strong>
            </div>
            <div
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                width: '70%',
                textAlign: 'right',
              }}
            >
              <h1 style={{ margin: '0' }}>PURCHASE ORDER</h1>
              Order #{resource.key} | {formattedDate}
            </div>
          </div>
          <div className="AccNo">
            Example Account Name
            <br />
            1234 Street Address, City, State, Zip
          </div>
          <div className="content">
            <div
              className="notes"
              style={{
                display: 'inline-block',
                maxWidth: '60%',
                verticalAlign: 'top',
              }}
            >
              <table>
                <thead>
                  <tr style={{ backgroundColor: '#CCCCCC' }}>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Please deliver by the end of the month.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              className="payment-terms"
              style={{
                display: 'inline-block',
                maxWidth: '35%',
                verticalAlign: 'top',
                minWidth: '35%',
                marginLeft: '20px',
              }}
            >
              <table>
                <thead>
                  <tr style={{ backgroundColor: '#CCCCCC' }}>
                    <th colSpan={3}>Payment Terms</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Currency</td>
                    <td>USD</td>
                  </tr>
                  <tr>
                    <td>Payment Terms</td>
                    <td>Net 30</td>
                  </tr>
                  <tr>
                    <td>Taxable</td>
                    <td>Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              className="vendor"
              style={{
                display: 'inline-block',
                maxWidth: '29%',
                verticalAlign: 'top',
                minWidth: '29%',
              }}
            >
              <table>
                <thead>
                  <tr style={{ backgroundColor: '#CCCCCC' }}>
                    <th colSpan={2}>Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Vendor Co.</td>
                  </tr>
                  <tr>
                    <td>5678 Vendor St, City, State, Zip</td>
                  </tr>
                  <tr>
                    <td>c/o John Doe</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              className="shipping"
              style={{
                display: 'inline-block',
                maxWidth: '68%',
                verticalAlign: 'top',
                minWidth: '68%',
                marginLeft: '20px',
              }}
            >
              <table>
                <thead>
                  <tr style={{ backgroundColor: '#CCCCCC' }}>
                    <th colSpan={2}>Shipping</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <strong>Shipping Address:</strong>
                      <br />
                      [shipping address field]
                      <br />
                      <strong>c/o:</strong>
                      <br />
                      [recipient field contact info]
                    </td>
                    <td style={{ width: '50%' }}>
                      <table style={{ width: '100%', border: '0' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '2px', border: '0' }}>
                              <strong>Method</strong>
                            </td>
                            <td style={{ padding: '2px', border: '0' }}>
                              [method field]
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px', border: '0' }}>
                              <strong>Account #</strong>
                            </td>
                            <td style={{ padding: '2px', border: '0' }}>
                              [account field]
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px', border: '0' }}>
                              <strong>Incoterms</strong>
                            </td>
                            <td style={{ padding: '2px', border: '0' }}>
                              [incoterms field]
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px', border: '0' }}>
                              <strong>Shipping Notes</strong>
                            </td>
                            <td style={{ padding: '2px', border: '0' }}>
                              [shipping notes field]
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="items">
              <table>
                <thead>
                  <tr style={{ backgroundColor: '#CCCCCC' }}>
                    <th>#</th>
                    <th>Item</th>
                    <th>Unit</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td style={{ fontWeight: 'bold' }}>
                      Widget A
                      <br />
                      High-quality widget for industrial use.
                      <br />
                      Serial: 123-ABC
                    </td>
                    <td>pcs</td>
                    <td>10</td>
                    <td>$50.00</td>
                    <td>$500.00</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td style={{ fontWeight: 'bold' }}>
                      Widget B
                      <br />
                      Standard widget for general use.
                      <br />
                      Serial: 456-DEF
                    </td>
                    <td>pcs</td>
                    <td>20</td>
                    <td>$30.00</td>
                    <td>$600.00</td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ fontWeight: 'bold' }}>
                      SUBTOTAL
                    </td>
                    <td>$1,100.00</td>
                  </tr>
                  <tr>
                    <td colSpan={5}>Tax</td>
                    <td>$110.00</td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ fontWeight: 'bold' }}>
                      TOTAL
                    </td>
                    <td>$1,210.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="terms-conditions">
              <table>
                <thead>
                  <tr style={{ backgroundColor: '#CCCCCC' }}>
                    <th>Terms and Conditions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>[Terms and Conditions field]</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="reference-number">
              <table>
                <thead>
                  <tr style={{ backgroundColor: '#CCCCCC' }}>
                    <th>Reference Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>[Reference Number field]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    </div>
  )
}
