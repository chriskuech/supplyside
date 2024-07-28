/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

'use server'

import { ReactNode } from 'react'
import { Cost } from '@prisma/client'
import prisma from '../prisma'
import {
  BgColorHeader,
  Border0Padding,
  CurrencyPadding,
  PoDocumentStyles,
  RemovePaddingAndBorder,
} from './PoDocumentStyles'
import { readResource } from '@/domain/resource/actions'
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

  const vendor = await readResource({
    accountId,
    id: resource.fields.find((f) => f.templateId === fields.vendor.templateId)
      ?.value.resource?.id as string,
    type: 'Vendor',
  })

  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  const base64Url = account?.logoBlobId
    ? `data:image/png;base64,${(await readBlob({ accountId, blobId: account.logoBlobId }))?.buffer.toString('base64')}`
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
      <Border0Padding />
      <CurrencyPadding />
      <RemovePaddingAndBorder />
      <BgColorHeader />
      <div className="header1" style={{ padding: '20px' }}>
        <div
          style={{
            display: 'inline-block',
            verticalAlign: 'top',
            width: '25%',
          }}
        >
          <img
            src={base64Url}
            alt="Logo"
            style={{ height: '100px', width: '100px' }}
          />
        </div>
        <div
          style={{
            display: 'inline-block',
            verticalAlign: 'top',
            width: '70%',
            textAlign: 'right',
          }}
        >
          <h1 style={{ margin: '0', fontWeight: '600' }}>PURCHASE ORDER</h1>
          Order #{resource.key} | {formattedDate}
        </div>
      </div>
      <div className="AccNo">
        <span style={{ fontWeight: 600 }}>{account?.name}</span>
        <br />
        <span>{account?.address}</span>
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
          <table style={{ border: '1px solid', minHeight: '100px' }}>
            <thead>
              <tr className="bg-color-header">
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={3}>
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
          className="payment-terms"
          style={{
            display: 'inline-block',
            maxWidth: '37%',
            verticalAlign: 'top',
            minWidth: '37%',
            marginLeft: '20px',
          }}
        >
          <table style={{ border: '1px solid', minHeight: '100px' }}>
            <thead>
              <tr className="bg-color-header">
                <th colSpan={3}>Payment Terms</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 0, padding: '2px', fontWeight: '600' }}>
                  Currency
                </td>
                <td className="border-0-padding">
                  {
                    resource.fields.find(
                      (f) => f.templateId === fields.currency.templateId,
                    )?.value.option?.name
                  }
                </td>
              </tr>
              <tr>
                <td style={{ border: 0, padding: '2px', fontWeight: '600' }}>
                  Payment Terms
                </td>
                <td className="border-0-padding">
                  {
                    resource.fields.find(
                      (f) => f.templateId === fields.paymentTerms.templateId,
                    )?.value.option?.name
                  }
                </td>
              </tr>
              <tr>
                <td style={{ border: 0, padding: '2px', fontWeight: '600' }}>
                  Taxable
                </td>
                <td className="border-0-padding">
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
        <div
          className="vendor"
          style={{
            display: 'inline-block',
            maxWidth: '29%',
            verticalAlign: 'top',
            minWidth: '29%',
          }}
        >
          <table style={{ border: '1px solid', minHeight: '170px' }}>
            <thead>
              <tr className="bg-color-header">
                <th style={{ fontWeight: '600' }}>Vendor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-0-padding">
                  {
                    vendor.fields.find(
                      (f) => f.templateId === fields.name.templateId,
                    )?.value.string
                  }
                </td>
              </tr>
              <tr>
                <td className="border-0-padding">
                  {
                    vendor.fields.find(
                      (f) => f.templateId === fields.primaryAddress.templateId,
                    )?.value.string
                  }
                </td>
              </tr>
              <tr>
                <td rowSpan={4} className="border-0-padding">
                  <br />
                  <u>
                    <b>c/o:</b>
                  </u>
                  <br />
                  {
                    vendor.fields.find(
                      (f) => f.templateId === fields.poRecipient.templateId,
                    )?.value.contact?.title
                  }
                </td>
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
          <table style={{ border: '1px solid', minHeight: '170px' }}>
            <thead>
              <tr className="bg-color-header">
                <th colSpan={2}>Shipping</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{ width: '50%', verticalAlign: 'top', padding: '5px' }}
                >
                  {
                    resource.fields.find(
                      (f) => f.templateId === fields.shippingAddress.templateId,
                    )?.value.string
                  }
                </td>
                <td style={{ width: '50%', padding: 0 }}>
                  <table style={{ width: '100%', border: '0', margin: 0 }}>
                    <tbody>
                      <tr>
                        <td className="border-0-padding">
                          <strong>Method</strong>
                        </td>
                        <td className="border-0-padding">
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
                        <td className="border-0-padding">
                          <strong>Account #</strong>
                        </td>
                        <td className="border-0-padding">
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
                        <td
                          style={{
                            padding: '2px',
                            border: '0',
                            fontWeight: 'bold',
                          }}
                        >
                          Incoterms
                        </td>
                        <td className="border-0-padding">
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
                      padding: '2px 5px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    Shipping Notes
                  </p>
                  <p
                    style={{
                      margin: 0,
                      padding: '2px 5px',
                    }}
                  >
                    {
                      resource.fields.find(
                        (f) => f.templateId === fields.shippingNotes.templateId,
                      )?.value.string
                    }
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="items">
          <table>
            <thead>
              <tr className="bg-color-header">
                <th style={{ borderRight: 0 }}>#</th>
                <th className="remove-padding-border">Item</th>
                <th className="remove-padding-border">Unit</th>
                <th className="remove-padding-border">Qty</th>
                <th className="remove-padding-border">Unit Price</th>
                <th style={{ borderLeft: 0 }}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={2} style={{ borderRight: 0, fontWeight: 'bold' }}>
                  1
                </td>
                <td
                  rowSpan={2}
                  style={{ fontWeight: 'bold', borderRight: 0, borderLeft: 0 }}
                >
                  [item name]
                  <br />
                  [item decsription]
                </td>
                <td style={{ border: 0 }}>[item oum]</td>
                <td style={{ border: 0 }}>[qty]</td>
                <td style={{ border: 0 }}>[unit]</td>
                <td style={{ borderLeft: 0, textAlign: 'right' }}>[total]</td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ border: 0, margin: 0 }}>
                    <tr>
                      <td
                        style={{
                          border: 0,
                          padding: '2px 5px',
                          fontWeight: 600,
                        }}
                      >
                        [custom field]
                      </td>
                      <td style={{ border: 0, padding: '2px 5px' }}>
                        [custom field value]
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: 0,
                          padding: '2px 5px',
                          fontWeight: 600,
                        }}
                      >
                        [custom field]
                      </td>
                      <td style={{ border: 0, padding: '2px 5px' }}>
                        [custom field value]
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td rowSpan={2} style={{ borderRight: 0, fontWeight: 'bold' }}>
                  2
                </td>
                <td
                  rowSpan={2}
                  style={{ fontWeight: 'bold', borderRight: 0, borderLeft: 0 }}
                >
                  [item name]
                  <br />
                  [item decsription]
                </td>
                <td style={{ border: 0 }}>[item oum]</td>
                <td style={{ border: 0 }}>[qty]</td>
                <td style={{ border: 0 }}>[unit]</td>
                <td style={{ borderLeft: 0, textAlign: 'right' }}>[total]</td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ border: 0, margin: 0 }}>
                    <tr>
                      <td
                        style={{
                          border: 0,
                          padding: '2px 5px',
                          fontWeight: 600,
                        }}
                      >
                        [custom field]
                      </td>
                      <td style={{ border: 0, padding: '2px 5px' }}>
                        [custom field value]
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: 0,
                          padding: '2px 5px',
                          fontWeight: 600,
                        }}
                      >
                        [custom field]
                      </td>
                      <td style={{ border: 0, padding: '2px 5px' }}>
                        [custom field value]
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={3}
                  style={{ border: 0, margin: 0, padding: 0 }}
                ></td>
                <td colSpan={3} style={{ border: 0, margin: 0, padding: 0 }}>
                  <table width={'100%'} style={{ border: 0, margin: 0 }}>
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          fontWeight: 'bold',
                          borderBottom: 0,
                          borderTop: 0,
                          padding: '2px 5px',
                        }}
                      >
                        SUBTOTAL
                      </td>
                      <td
                        style={{
                          fontWeight: 'bold',
                          borderBottom: 0,
                          borderTop: 0,
                          padding: '2px 5px',
                          textAlign: 'right',
                        }}
                      >
                        $
                        {resource.fields.find(
                          (rf) =>
                            rf.templateId === fields.subtotalCost.templateId,
                        )?.value.number || 0}
                      </td>
                    </tr>
                    <tr>
                      {resource.costs.map((item: Cost, index: number) => (
                        <tr key={index}>
                          <td
                            style={{
                              borderBottom: 0,
                              borderTop: 0,
                              padding: '2px 5px',
                            }}
                            colSpan={5}
                          >
                            {item.name}
                          </td>
                          <td
                            style={{
                              borderBottom: 0,
                              borderTop: 0,
                              padding: '2px 5px',
                              textAlign: 'right',
                            }}
                          >
                            ${item.value}
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
                          padding: '2px 5px',
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          fontWeight: 'bold',
                          backgroundColor: '#C7E1F2',
                          borderTop: 0,
                          padding: '2px 5px',
                          textAlign: 'right',
                        }}
                      >
                        $
                        {resource.fields.find(
                          (rf) => rf.templateId === fields.totalCost.templateId,
                        )?.value.number || 0}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="terms-conditions">
          <table>
            <thead>
              <tr className="bg-color-header">
                <th>Terms and Conditions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
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
