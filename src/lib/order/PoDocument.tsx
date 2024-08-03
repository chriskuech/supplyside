/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

'use server'

import { ReactNode } from 'react'
import { Cost, FieldType } from '@prisma/client'
import { P, match } from 'ts-pattern'
import prisma from '../prisma'
import { PoDocumentStyles, styles } from './PoDocumentStyles'
import { readResource, readResources } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'
import { readBlob } from '@/domain/blobs/actions'
import { readSchema } from '@/domain/schema/actions'
import { selectValue } from '@/domain/resource/types'

type Props = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

export default async function PoDocument({
  accountId,
  resourceId,
}: Props): Promise<ReactNode> {
  const resource = await readResource({
    accountId,
    id: resourceId,
    type: 'Order',
  })

  const vendorId = selectValue(resource, fields.vendor)?.resource?.id

  const vendor = vendorId
    ? await readResource({
        accountId,
        id: vendorId,
        type: 'Vendor',
      })
    : undefined

  const lines = await readResources({
    accountId,
    type: 'Line',
    where: {
      '==': [{ var: 'Order' }, resource?.id],
    },
  })

  const lineSchema = await readSchema({ accountId, resourceType: 'Line' })

  const customFields = lineSchema.allFields.filter(
    (field) =>
      field.templateId !== null &&
      ![
        fields.totalCost.templateId,
        fields.unitOfMeasure.templateId,
        fields.unitCost.templateId,
        fields.quantity.templateId,
      ].includes(field.templateId) &&
      field.type !== 'Resource',
  )

  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  const blob = account.logoBlobId
    ? await readBlob({
        accountId,
        blobId: account.logoBlobId,
      })
    : undefined

  const base64Url = account?.logoBlobId
    ? `data:${blob?.mimeType};base64,${blob?.buffer.toString('base64')}`
    : undefined

  const issuedDate = selectValue(resource, fields.issuedDate)?.date

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
          Order #{resource.key} <span style={{ margin: '0px 5px' }}>|</span>{' '}
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
                    {selectValue(resource, fields.orderNotes)?.string}
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
                    {selectValue(resource, fields.currency)?.option?.name}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Payment Terms
                  </td>
                  <td style={styles.PaymentPadding}>
                    {selectValue(resource, fields.paymentTerms)?.option?.name}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Taxable
                  </td>
                  <td style={styles.PaymentPadding}>
                    {selectValue(resource, fields.taxable)?.boolean
                      ? 'Yes'
                      : 'No'}
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
                    {selectValue(resource, fields.vendor)?.resource?.name}
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
                    {selectValue(resource, fields.shippingAddress)?.string}
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
                              selectValue(resource, fields.shippingMethod)
                                ?.option?.name
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
                              selectValue(
                                resource,
                                fields.shippingAccountNumber,
                              )?.option?.name
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
                            {
                              selectValue(resource, fields.incoterms)?.option
                                ?.name
                            }
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
                      {selectValue(resource, fields.shippingNotes)?.string}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.MarginBottomForTable}>
          <table>
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
                  return (
                    <>
                      <tr style={{ pageBreakInside: 'avoid' }}>
                        <td rowSpan={2} style={styles.TotalAndSubtotalCssClass}>
                          {index + 1}
                        </td>
                        <td
                          rowSpan={2}
                          style={{
                            ...styles.TotalAndSubtotalCssClass,
                            borderLeft: 0,
                            minWidth: '275px',
                            verticalAlign: 'top',
                          }}
                        >
                          {selectValue(line, fields.item)?.resource?.name}{' '}
                          <span
                            style={{
                              fontWeight: 'normal',
                              color: '#575656',
                              marginTop: '13px',
                              display: 'block',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {selectValue(line, fields.description)?.string}
                          </span>
                        </td>
                        <td
                          style={{
                            border: 0,
                            width: '100px',
                            verticalAlign: 'top',
                          }}
                        >
                          {item &&
                            selectValue(item, fields.unitOfMeasure)?.option
                              ?.name}
                        </td>

                        <td
                          style={{
                            border: 0,
                            textAlign: 'right',
                            verticalAlign: 'top',
                          }}
                        >
                          {selectValue(line, fields.quantity)?.number}
                        </td>
                        <td
                          style={{
                            border: 0,
                            textAlign: 'right',
                            width: '100px',
                            verticalAlign: 'top',
                          }}
                        >
                          {selectValue(
                            line,
                            fields.unitCost,
                          )?.number?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
                        <td
                          style={{
                            borderLeft: 0,
                            textAlign: 'right',
                            width: '100px',
                            verticalAlign: 'top',
                          }}
                        >
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
                          style={{ padding: 0, verticalAlign: 'top' }}
                        >
                          <table style={{ border: 0, margin: 0 }}>
                            {customFields.map((customField) => {
                              const fieldValue = line.fields.find(
                                (f) => f.fieldId === customField.id,
                              )?.value

                              const renderFieldValue = match<
                                FieldType,
                                string | null
                              >(customField.type)
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
                                    ? new Date(
                                        fieldValue.date,
                                      ).toLocaleDateString()
                                    : null,
                                )
                                .with('File', () =>
                                  fieldValue?.file ? 'File Attached' : null,
                                )
                                .with('Money', () =>
                                  fieldValue?.number
                                    ? fieldValue.number.toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'USD',
                                        },
                                      )
                                    : null,
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
                                .with(
                                  'Textarea',
                                  () => fieldValue?.string || null,
                                )
                                .with(
                                  'Select',
                                  () => fieldValue?.option?.id ?? null,
                                )
                                .with(
                                  'User',
                                  () => fieldValue?.user?.fullName ?? null,
                                )
                                .with('Resource', () => null)
                                .exhaustive()

                              if (renderFieldValue === null) return null

                              return (
                                <tr key={customField.id}>
                                  <td
                                    style={{
                                      border: 0,
                                      padding: '5px 8px',
                                      fontWeight: 600,
                                      width: '50%',
                                      verticalAlign: 'top',
                                    }}
                                  >
                                    {customField.name}
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
                            })}
                          </table>
                        </td>
                      </tr>
                    </>
                  )
                }),
              )}

              <tr>
                <td
                  colSpan={2}
                  style={{ border: 0, margin: 0, padding: 0 }}
                ></td>
                <td
                  colSpan={4}
                  style={{
                    border: 0,
                    margin: 0,
                    padding: 0,
                    paddingLeft: '105px',
                  }}
                >
                  <table style={{ border: 0, margin: 0 }}>
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          ...styles.PaddingAndBorderTopClass,
                          fontWeight: 'bold',
                          ...styles.BgColorHeader,
                        }}
                      >
                        SUBTOTAL
                      </td>
                      <td
                        style={{
                          ...styles.PaddingAndBorderTopClass,
                          ...styles.BgColorHeader,
                          fontWeight: 'bold',
                          textAlign: 'right',
                        }}
                      >
                        {(
                          selectValue(resource, fields.subtotalCost)?.number ||
                          0
                        ).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                    </tr>
                    {resource.costs.map((item: Cost, index: number) => {
                      const subtotal =
                        selectValue(resource, fields.subtotalCost)?.number || 0

                      const costValue = item.isPercentage
                        ? subtotal * (item.value / 100)
                        : item.value

                      return (
                        <tr key={index}>
                          <td
                            style={styles.PaddingAndBorderTopClass}
                            colSpan={5}
                          >
                            {item.name}
                          </td>
                          <td
                            style={{
                              ...styles.PaddingAndBorderTopClass,
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
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          fontWeight: 'bold',
                          borderTop: 0,
                          padding: '5px 8px',
                          ...styles.SubtotalAndTotalClass,
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          fontWeight: 'bold',
                          borderTop: 0,
                          padding: '5px 8px',
                          textAlign: 'right',
                          ...styles.SubtotalAndTotalClass,
                        }}
                      >
                        {selectValue(
                          resource,
                          fields.totalCost,
                        )?.number?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
                {selectValue(resource, fields.termsAndConditions)?.string}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
