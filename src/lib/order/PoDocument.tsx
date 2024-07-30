/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

'use server'

import { ReactNode } from 'react'
import { Cost } from '@prisma/client'
import prisma from '../prisma'
import { PoDocumentStyles, styles } from './PoDocumentStyles'
import { readResource, readResources } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'
import { readBlob } from '@/domain/blobs/actions'

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

  const vendorId = resource.fields.find(
    (f) => f.templateId === fields.vendor.templateId,
  )?.value.resource?.id
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

  const issuedDate = resource.fields.find(
    (f) => f.templateId === fields.issuedDate.templateId,
  )?.value.date

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
          <h1 style={{ margin: '0', fontWeight: '600' }}>PURCHASE ORDER</h1>
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
          <div style={{ flex: '1', marginBottom: '10px' }}>
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
                    style={{ verticalAlign: 'top', whiteSpace: 'pre-wrap' }}
                  >
                    {
                      resource.fields.find(
                        (f) => f.templateId === fields.orderNotes.templateId,
                      )?.value.string
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            style={{
              minWidth: '260px',
              marginLeft: '20px',
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
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Currency
                  </td>
                  <td style={styles.PaymentPadding}>
                    {
                      resource.fields.find(
                        (f) => f.templateId === fields.currency.templateId,
                      )?.value.option?.name
                    }
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Payment Terms
                  </td>
                  <td style={styles.PaymentPadding}>
                    {
                      resource.fields.find(
                        (f) => f.templateId === fields.paymentTerms.templateId,
                      )?.value.option?.name
                    }
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ border: 0, padding: '2px 8px', fontWeight: '600' }}
                  >
                    Taxable
                  </td>
                  <td style={styles.PaymentPadding}>
                    {resource.fields.find(
                      (f) => f.templateId === fields.taxable.templateId,
                    )?.value.boolean
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
            }}
          >
            <table
              style={{
                border: '1px solid',
                minHeight: '170px',
                marginBottom: '20px',
              }}
            >
              <thead>
                <tr style={styles.BgColorHeader}>
                  <th style={{ fontWeight: '600' }}>Vendor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.Border0Padding}>
                    {
                      vendor?.fields?.find(
                        (f) => f.templateId === fields.name.templateId,
                      )?.value.string
                    }
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ ...styles.Border0Padding, whiteSpace: 'pre-wrap' }}
                  >
                    {
                      vendor?.fields.find(
                        (f) =>
                          f.templateId === fields.primaryAddress.templateId,
                      )?.value.string
                    }
                  </td>
                </tr>
                <tr>
                  <td rowSpan={4} style={styles.Border0Padding}>
                    <br />
                    <u>
                      <b>c/o:</b>
                    </u>
                    <br />
                    {
                      vendor?.fields.find(
                        (f) => f.templateId === fields.poRecipient.templateId,
                      )?.value.contact?.title
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            style={{
              flex: '1',
              marginLeft: '20px',
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
                    {
                      resource.fields.find(
                        (f) =>
                          f.templateId === fields.shippingAddress.templateId,
                      )?.value.string
                    }
                  </td>
                  <td style={{ padding: '0px' }}>
                    <table style={{ border: '0', margin: 0 }}>
                      <tbody>
                        <tr>
                          <td style={styles.ShippingCss}>Method</td>
                          <td style={styles.PaymentPadding}>
                            {
                              resource.fields.find(
                                (f) =>
                                  f.templateId ===
                                  fields.shippingMethod.templateId,
                              )?.value.option?.name
                            }
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.ShippingCss}>Account #</td>
                          <td style={styles.PaymentPadding}>
                            {
                              resource.fields.find(
                                (f) =>
                                  f.templateId ===
                                  fields.shippingAccountNumber.templateId,
                              )?.value.option?.name
                            }
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.ShippingCss}>Incoterms</td>
                          <td style={styles.PaymentPadding}>
                            {
                              resource.fields.find(
                                (f) =>
                                  f.templateId === fields.incoterms.templateId,
                              )?.value.option?.name
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
                        padding: '5px 8px',
                      }}
                    >
                      {
                        resource.fields.find(
                          (f) =>
                            f.templateId === fields.shippingNotes.templateId,
                        )?.value.string
                      }
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="items">
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
              {lines.map((line, index) => (
                <>
                  <tr>
                    <td rowSpan={2} style={styles.TotalAndSubtotalCssClass}>
                      {index + 1}
                    </td>
                    <td
                      rowSpan={2}
                      style={{
                        ...styles.TotalAndSubtotalCssClass,
                        borderLeft: 0,
                        minWidth: '275px',
                      }}
                    >
                      [item name]
                      <br />
                      <span style={{ fontWeight: 'normal', color: '#575656' }}>
                        [item decsription]
                      </span>
                    </td>
                    <td style={{ border: 0, width: '100px' }}>[unit]</td>
                    <td style={{ border: 0, textAlign: 'right' }}>
                      {
                        line.fields.find(
                          (f) => f.templateId === fields.quantity.templateId,
                        )?.value.number
                      }
                    </td>
                    <td
                      style={{ border: 0, textAlign: 'right', width: '100px' }}
                    >
                      {(
                        line.fields.find(
                          (f) => f.templateId === fields.unitCost.templateId,
                        )?.value.number || 0
                      ).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </td>
                    <td
                      style={{
                        borderLeft: 0,
                        textAlign: 'right',
                        width: '100px',
                      }}
                    >
                      {(
                        line.fields.find(
                          (f) => f.templateId === fields.totalCost.templateId,
                        )?.value.number || 0
                      ).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <table style={{ border: 0, margin: 0 }}>
                        <tr>
                          <td
                            style={{
                              border: 0,
                              padding: '5px 8px',
                              fontWeight: 600,
                              width: '150px',
                            }}
                          >
                            [custom field]
                          </td>
                          <td style={{ border: 0, padding: '5px 8px' }}>
                            [custom field value]
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </>
              ))}

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
                    paddingLeft: '170px',
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
                          resource.fields.find(
                            (rf) =>
                              rf.templateId === fields.subtotalCost.templateId,
                          )?.value.number || 0
                        ).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                    </tr>
                    <tr>
                      {resource.costs.map((item: Cost, index: number) => (
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
                            {(item.value || 0).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          fontWeight: 'bold',
                          backgroundColor: '#C7E1F2',
                          borderTop: 0,
                          padding: '5px 8px',
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          fontWeight: 'bold',
                          backgroundColor: '#C7E1F2',
                          borderTop: 0,
                          padding: '5px 8px',
                          textAlign: 'right',
                        }}
                      >
                        {(
                          resource.fields.find(
                            (rf) =>
                              rf.templateId === fields.totalCost.templateId,
                          )?.value.number || 0
                        ).toLocaleString('en-US', {
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
        <div style={{ pageBreakBefore: 'always' }}>
          <table style={{ minHeight: '200px', marginTop: '20px' }}>
            <thead>
              <tr style={styles.BgColorHeader}>
                <th>Terms and Conditions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  {
                    resource.fields.find(
                      (f) =>
                        f.templateId === fields.termsAndConditions.templateId,
                    )?.value.string
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
