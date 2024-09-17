/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { ReactNode } from 'react'
import { isTruthy } from 'remeda'
import { PoDocumentStyles, styles } from './PoDocumentStyles'
import { OrderViewModel } from './ViewModel'

export default function PoDocument({
  lines,
  issuedDate,
  logoBlobDataUrl,
  accountName,
  accountAddress,
  termsAndConditions,
  notes,
  subtotal,
  total,
  number,
  currency,
  vendorName,
  paymentTerms,
  taxable,
  costs,
  shippingAccountNumber,
  shippingAddress,
  shippingMethod,
  incoterms,
  shippingNotes,
  poRecipientName,
  vendorPrimaryAddress,
}: OrderViewModel): ReactNode {
  return (
    <div>
      <PoDocumentStyles />
      <div style={{ ...styles.HeaderCssClass, padding: '0px 20px' }}>
        <div style={{ flex: '1' }}>
          {logoBlobDataUrl && (
            <img
              src={logoBlobDataUrl}
              alt="Logo"
              style={{ maxHeight: '100px', maxWidth: '100px' }}
            />
          )}
        </div>
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <h1
            style={{
              margin: '0',
              fontWeight: '600',
              lineHeight: '30px',
              marginBottom: '5px',
            }}
          >
            PURCHASE ORDER
          </h1>
          Order #{number} <span style={{ margin: '0px 5px' }}>|</span>{' '}
          {issuedDate ?? 'N/A'}
        </div>
      </div>
      <div style={{ padding: '0px 20px' }}>
        <div style={{ fontWeight: 600 }}>{accountName}</div>
        <div style={{ whiteSpace: 'pre' }}>{accountAddress}</div>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={styles.HeaderCssClass}>
          <div style={{ flex: '1', ...styles.MarginBottomForTable }}>
            <table
              style={{
                border: '1px solid',
                minHeight: '100px',
              }}
            >
              <thead>
                <tr style={styles.BgColorHeader}>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    rowSpan={3}
                    style={{
                      verticalAlign: 'top',
                      whiteSpace: 'pre-wrap',
                      ...styles.TopMarginClass,
                    }}
                  >
                    {notes}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            style={{
              minWidth: '260px',
              marginLeft: '20px',
              ...styles.MarginBottomForTable,
            }}
          >
            <table
              style={{
                border: '1px solid',
                minHeight: '100px',
              }}
            >
              <thead>
                <tr style={styles.BgColorHeader}>
                  <th colSpan={3}>Payment Terms</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: 0,
                      padding: '3px 8px 2px',
                      fontWeight: '600',
                    }}
                  >
                    Currency
                  </td>
                  <td style={styles.PaymentPadding}>{currency}</td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Payment Terms
                  </td>
                  <td style={styles.PaymentPadding}>{paymentTerms}</td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Taxable
                  </td>
                  <td style={styles.PaymentPadding}>{taxable}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style={styles.HeaderCssClass}>
          <div
            style={{
              minWidth: '250px',
              ...styles.MarginBottomForTable,
            }}
          >
            <table
              style={{
                border: '1px solid',
                minHeight: '170px',
              }}
            >
              <thead>
                <tr style={styles.BgColorHeader}>
                  <th style={{ fontWeight: '600' }}>Vendor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      ...styles.Border0Padding,
                      ...styles.TopMarginClass,
                      verticalAlign: 'top',
                      fontWeight: 'bold',
                      paddingBottom: '0px',
                    }}
                  >
                    {vendorName}
                    <span
                      style={{
                        whiteSpace: 'pre-wrap',
                        padding: '0px',
                        display: 'block',
                        fontWeight: 'normal',
                      }}
                    >
                      {vendorPrimaryAddress}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td rowSpan={5} style={styles.Border0Padding}>
                    <u style={{ display: 'block', margin: '5px 0px' }}>
                      <b>c/o:</b>
                    </u>
                    {poRecipientName}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            style={{
              flex: '1',
              marginLeft: '20px',
              ...styles.MarginBottomForTable,
            }}
          >
            <table
              style={{
                border: '1px solid',
                minHeight: '170px',
              }}
            >
              <thead>
                <tr style={styles.BgColorHeader}>
                  <th colSpan={2}>Shipping</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      width: '200px',
                      verticalAlign: 'top',
                      padding: '5px 8px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {shippingAddress}
                  </td>
                  <td style={{ padding: '3px 0px', verticalAlign: 'top' }}>
                    <table style={{ border: '0', margin: 0 }}>
                      <tbody>
                        <tr>
                          <td style={styles.ShippingCss}>Method</td>
                          <td
                            style={{
                              ...styles.PaymentPadding,
                              verticalAlign: 'top',
                            }}
                          >
                            {shippingMethod}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.ShippingCss}>Account #</td>
                          <td
                            style={{
                              ...styles.PaymentPadding,
                              verticalAlign: 'top',
                            }}
                          >
                            {shippingAccountNumber}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.ShippingCss}>Incoterms</td>
                          <td
                            style={{
                              ...styles.PaymentPadding,
                              verticalAlign: 'top',
                            }}
                          >
                            {incoterms}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    style={{ padding: 0, border: '0', verticalAlign: 'top' }}
                  >
                    <p
                      style={{
                        margin: 0,
                        padding: '5px 8px',
                        fontWeight: 600,
                        textDecoration: 'underline',
                      }}
                    >
                      Shipping Notes
                    </p>
                    <p
                      style={{
                        margin: 0,
                        padding: '0px 8px 5px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {shippingNotes}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* -- BEGIN: Lines + Cost -- */}
        <div style={styles.MarginBottomForTable}>
          {/* -- BEGIN: Lines -- */}
          <table
            style={{
              border: '1px solid black',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={styles.BgColorHeader}>
                <th style={{ borderRight: 0 }}>#</th>
                <th style={styles.RemovePaddingAndBorder}>Item</th>
                <th style={styles.RemovePaddingAndBorder}>Unit</th>
                <th style={styles.UnitPriceCSS}>Qty</th>
                <th style={styles.UnitPriceCSS}>Unit Price</th>
                <th style={{ borderLeft: 0, textAlign: 'right' }}>
                  Total Price
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map(async (line, index) => {
                const lineAdditionalFieldsRows = line.additionalFields
                  .map(({ key, value }, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          border: 0,
                          padding: '5px 8px',
                          fontWeight: 600,
                          width: '50%',
                          verticalAlign: 'top',
                        }}
                      >
                        {key}
                      </td>
                      <td
                        style={{
                          border: 0,
                          padding: '5px 8px',
                          textAlign: 'left',
                          verticalAlign: 'top',
                        }}
                      >
                        {value}
                      </td>
                    </tr>
                  ))
                  .filter(isTruthy)

                const tdStyle = {
                  border: 0,
                  textAlign: 'right',
                  width: '100px',
                  verticalAlign: 'top',
                } as const

                return (
                  <>
                    <tr
                      style={{
                        pageBreakInside: 'avoid',
                        borderTop: '1px solid black',
                      }}
                    >
                      <td
                        rowSpan={2}
                        style={{
                          borderRight: 0,
                          fontWeight: 'bold',
                          verticalAlign: 'top',
                        }}
                      >
                        {index + 1}
                      </td>
                      <td
                        rowSpan={2}
                        style={{
                          borderRight: 0,
                          verticalAlign: 'top',
                          borderLeft: 0,
                          minWidth: '275px',
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>
                          {line.itemName}
                        </div>
                        <div
                          style={{
                            fontWeight: 'normal',
                            color: '#575656',
                            marginTop: '13px',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {line.itemDescription}
                        </div>
                      </td>
                      <td style={tdStyle}>{line.unitOfMeasure}</td>
                      <td style={tdStyle}>{line.quantity}</td>
                      <td style={tdStyle}>{line.unitCost}</td>
                      <td style={tdStyle}>{line.totalCost}</td>
                    </tr>
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: 0,
                          verticalAlign: 'top',
                          border: 0,
                        }}
                      >
                        {!!lineAdditionalFieldsRows.length && (
                          <table
                            id="line-additional-fields"
                            style={{
                              border: 'solid black',
                              borderWidth: '1px 0px 0px 1px',
                              margin: 0,
                            }}
                          >
                            {lineAdditionalFieldsRows}
                          </table>
                        )}
                      </td>
                    </tr>
                  </>
                )
              })}
            </tbody>
          </table>
          {/* -- BEGIN: Lines -- */}

          {/* -- BEGIN: Costs -- */}
          <div
            id="cost-aggregation-table"
            style={{ display: 'flex', justifyContent: 'end' }}
          >
            <div style={{ flexGrow: 1 }} />
            <div>
              <table
                style={{
                  border: '1px solid black',
                  borderTop: 0,
                  margin: 0,
                  breakInside: 'avoid',
                }}
              >
                <tr style={{ backgroundColor: '#CCCCCC', fontWeight: 'bold' }}>
                  <td
                    style={{
                      width: '150px',
                      borderTop: 0,
                      borderBottom: 0,
                      padding: '5px 8px',
                    }}
                  >
                    SUBTOTAL
                  </td>
                  <td
                    style={{
                      borderTop: 0,
                      borderBottom: 0,
                      padding: '5px 8px',
                      width: '100px',
                      textAlign: 'right',
                    }}
                  >
                    {subtotal}
                  </td>
                </tr>
                {costs.map(({ key, value }, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        borderTop: 0,
                        borderBottom: 0,
                        padding: '5px 8px',
                      }}
                    >
                      {key}
                    </td>
                    <td
                      style={{
                        borderTop: 0,
                        borderBottom: 0,
                        padding: '5px 8px',
                        textAlign: 'right',
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#C7E1F2' }}>
                  <td
                    style={{
                      fontWeight: 'bold',
                      border: 0,
                      borderLeft: '1px solid black',
                      padding: '5px 8px',
                    }}
                  >
                    TOTAL
                  </td>
                  <td
                    style={{
                      fontWeight: 'bold',
                      border: 0,
                      borderLeft: '1px solid black',
                      padding: '5px 8px',
                      textAlign: 'right',
                    }}
                  >
                    {total}
                  </td>
                </tr>
              </table>
            </div>
          </div>
          {/* -- END: Costs -- */}
        </div>
        {/* -- END: Lines + Cost -- */}

        {/* -- BEGIN: Ts & Cs -- */}
        <table
          style={{
            pageBreakInside: 'avoid',
            ...styles.MarginBottomForTable,
            minHeight: '170px',
          }}
        >
          <thead>
            <tr style={styles.BgColorHeader}>
              <th>Terms & Conditions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  verticalAlign: 'top',
                  textAlign: 'justify',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {termsAndConditions}
              </td>
            </tr>
          </tbody>
        </table>
        {/* -- END Ts & Cs -- */}
      </div>
    </div>
  )
}
