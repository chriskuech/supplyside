/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

'use server'

import { ReactNode } from 'react'
import { Cost, FieldType } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { isTruthy } from 'remeda'
import { PoDocumentStyles, styles } from './PoDocumentStyles'
import { readResource, readResources } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'
import { readBlob } from '@/domain/blobs/actions'
import { readSchema } from '@/domain/schema/actions'
import { selectValue } from '@/domain/resource/types'
import { allValues } from '@/lib/allValues'
import { readAccount } from '@/domain/iam/account/actions'

type Props = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

export default async function PoDocument({
  accountId,
  resourceId,
}: Props): Promise<ReactNode> {
  const { order, lines, lineSchema, account } = await allValues({
    order: readResource({
      accountId,
      id: resourceId,
    }),
    lines: readResources({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: 'Order' }, resourceId],
      },
    }),
    lineSchema: readSchema({ accountId, resourceType: 'Line' }),
    account: readAccount(accountId),
  })

  const vendorId = selectValue(order, fields.vendor)?.resource?.id

  const vendor = vendorId
    ? await readResource({
        accountId,
        id: vendorId,
        type: 'Vendor',
      })
    : undefined

  const lineAdditionalFields = lineSchema.allFields.filter(
    (field) =>
      ![
        fields.totalCost.templateId,
        fields.unitOfMeasure.templateId,
        fields.unitCost.templateId,
        fields.quantity.templateId,
      ].includes(field.templateId as string),
  )

  const blob = account.logoBlobId
    ? await readBlob({
        accountId,
        blobId: account.logoBlobId,
      })
    : undefined

  const base64Url = account?.logoBlobId
    ? `data:${blob?.mimeType};base64,${blob?.buffer.toString('base64')}`
    : undefined

  const issuedDate = selectValue(order, fields.issuedDate)?.date

  const formattedDate = issuedDate
    ? new Date(issuedDate).toLocaleDateString()
    : 'N/A'

  return (
    <div>
      <PoDocumentStyles />
      <div style={{ ...styles.HeaderCssClass, padding: '0px 20px' }}>
        <div style={{ flex: '1' }}>
          <img
            src={base64Url}
            alt="Logo"
            style={{ maxHeight: '100px', maxWidth: '100px' }}
          />
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
          Order #{order.key} <span style={{ margin: '0px 5px' }}>|</span>{' '}
          {formattedDate}
        </div>
      </div>
      <div style={{ padding: '0px 20px' }}>
        <div style={{ fontWeight: 600 }}>{account?.name}</div>
        <div style={{ whiteSpace: 'pre' }}>{account?.address}</div>
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
                    {selectValue(order, fields.orderNotes)?.string}
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
                  <td style={styles.PaymentPadding}>
                    {selectValue(order, fields.currency)?.option?.name}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Payment Terms
                  </td>
                  <td style={styles.PaymentPadding}>
                    {selectValue(order, fields.paymentTerms)?.option?.name}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Taxable
                  </td>
                  <td style={styles.PaymentPadding}>
                    {selectValue(order, fields.taxable)?.boolean ? 'Yes' : 'No'}
                  </td>
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
                    {selectValue(order, fields.vendor)?.resource?.name}
                    <span
                      style={{
                        whiteSpace: 'pre-wrap',
                        padding: '0px',
                        display: 'block',
                        fontWeight: 'normal',
                      }}
                    >
                      {vendor &&
                        selectValue(vendor, fields.primaryAddress)?.string}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td rowSpan={5} style={styles.Border0Padding}>
                    <u style={{ display: 'block', margin: '5px 0px' }}>
                      <b>c/o:</b>
                    </u>
                    {vendor &&
                      selectValue(vendor, fields.poRecipient)?.contact?.name}
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
                    {selectValue(order, fields.shippingAddress)?.string}
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
                            {
                              selectValue(order, fields.shippingMethod)?.option
                                ?.name
                            }
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
                            {
                              selectValue(order, fields.shippingAccountNumber)
                                ?.option?.name
                            }
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
                            {selectValue(order, fields.incoterms)?.option?.name}
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
                      {selectValue(order, fields.shippingNotes)?.string}
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
              {await Promise.all(
                lines.map(async (line, index) => {
                  const itemId = selectValue(line, fields.item)?.resource?.id
                  const item = itemId
                    ? await readResource({
                        accountId,
                        id: itemId,
                        type: 'Item',
                      })
                    : undefined

                  const lineAdditionalFieldsRows = lineAdditionalFields
                    .map((lineAdditionalField) => {
                      const fieldValue = line.fields.find(
                        (f) => f.fieldId === lineAdditionalField.id,
                      )?.value

                      const renderFieldValue = match<FieldType, string | null>(
                        lineAdditionalField.type,
                      )
                        .with('Checkbox', () =>
                          match(fieldValue?.boolean)
                            .with(true, () => 'Yes')
                            .with(false, () => 'No')
                            .with(P.nullish, () => null)
                            .exhaustive(),
                        )
                        .with(
                          'Contact',
                          () => fieldValue?.contact?.name || null,
                        )
                        .with('Date', () =>
                          fieldValue?.date
                            ? new Date(fieldValue.date).toLocaleDateString()
                            : null,
                        )
                        .with('File', () =>
                          fieldValue?.file ? 'File Attached' : null,
                        )
                        .with('Files', () =>
                          fieldValue?.files?.length ? 'Files Attached' : null,
                        )
                        .with(
                          'Money',
                          () =>
                            fieldValue?.number?.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }) ?? null,
                        )
                        .with(
                          'Number',
                          () => fieldValue?.number?.toString() ?? null,
                        )
                        .with(
                          'MultiSelect',
                          () =>
                            fieldValue?.options
                              ?.map((o) => o.name)
                              .join(', ') ?? null,
                        )
                        .with('Text', () => fieldValue?.string || null)
                        .with('Textarea', () => fieldValue?.string || null)
                        .with('Select', () => fieldValue?.option?.name ?? null)
                        .with('User', () => fieldValue?.user?.fullName ?? null)
                        .with('Resource', () => null)
                        .exhaustive()

                      if (renderFieldValue === null) return null

                      return (
                        <tr key={lineAdditionalField.id}>
                          <td
                            style={{
                              border: 0,
                              padding: '5px 8px',
                              fontWeight: 600,
                              width: '50%',
                              verticalAlign: 'top',
                            }}
                          >
                            {lineAdditionalField.name}
                          </td>
                          <td
                            style={{
                              border: 0,
                              padding: '5px 8px',
                              textAlign: 'left',
                              verticalAlign: 'top',
                            }}
                          >
                            {renderFieldValue}
                          </td>
                        </tr>
                      )
                    })
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
                            {item && selectValue(item, fields.name)?.string}
                          </div>
                          <div
                            style={{
                              fontWeight: 'normal',
                              color: '#575656',
                              marginTop: '13px',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {item &&
                              selectValue(item, fields.itemDescription)?.string}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          {
                            selectValue(line, fields.unitOfMeasure)?.option
                              ?.name
                          }
                        </td>

                        <td style={tdStyle}>
                          {selectValue(line, fields.quantity)?.number}
                        </td>
                        <td style={tdStyle}>
                          {selectValue(
                            line,
                            fields.unitCost,
                          )?.number?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
                        <td style={tdStyle}>
                          {selectValue(
                            line,
                            fields.totalCost,
                          )?.number?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
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
                }),
              )}
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
                    {(
                      selectValue(order, fields.subtotalCost)?.number || 0
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                </tr>
                {order.costs.map((item: Cost, index: number) => {
                  const subtotal =
                    selectValue(order, fields.subtotalCost)?.number || 0

                  const costValue = item.isPercentage
                    ? subtotal * (item.value / 100)
                    : item.value

                  return (
                    <tr key={index}>
                      <td
                        style={{
                          borderTop: 0,
                          borderBottom: 0,
                          padding: '5px 8px',
                        }}
                      >
                        {item.name}
                      </td>
                      <td
                        style={{
                          borderTop: 0,
                          borderBottom: 0,
                          padding: '5px 8px',
                          textAlign: 'right',
                        }}
                      >
                        {costValue.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                    </tr>
                  )
                })}
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
                    {selectValue(
                      order,
                      fields.totalCost,
                    )?.number?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
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
                {selectValue(order, fields.termsAndConditions)?.string}
              </td>
            </tr>
          </tbody>
        </table>
        {/* -- END Ts & Cs -- */}
      </div>
    </div>
  )
}
