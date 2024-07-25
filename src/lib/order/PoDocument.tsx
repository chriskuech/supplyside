/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

'use server'

import { ReactNode } from 'react'
import prisma from '../prisma'
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

  const [vendor] = await readResources({
    accountId,
    type: 'Vendor',
  })

  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  console.log('acc ', account)

  const base64Url = account?.logoBlobId
    ? `data:image/png;base64,${(await readBlob({ accountId, blobId: account.logoBlobId }))?.buffer.toString('base64')}`
    : undefined

  const issuedDate =
    resource.fields.find((field) => field.fieldType === 'Date')?.value.date ??
    null

  const formattedDate = issuedDate
    ? new Date(issuedDate).toLocaleDateString()
    : 'N/A'

  return (
    <div>
      <html>
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
                min-height: 400px; 
                line-height: 36px;
              }
              .reference-number td {
                min-height: 200px; 
                line-height: 36px;
              }
            `}
        </style>
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
            <h1 style={{ margin: '0' }}>PURCHASE ORDER</h1>
            Order #{resource.key} | {formattedDate}
          </div>
        </div>
        <div className="AccNo">
          {account?.name}
          <br />
          [Account Address]
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
                  <td>
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
                  <td>
                    {
                      resource.fields.find(
                        (f) => f.templateId === fields.currency.templateId,
                      )?.value.option?.name
                    }
                  </td>
                </tr>
                <tr>
                  <td>Payment Terms</td>
                  <td>
                    {
                      resource.fields.find(
                        (f) => f.templateId === fields.paymentTerms.templateId,
                      )?.value.option?.name
                    }
                  </td>
                </tr>
                <tr>
                  <td>Taxable</td>
                  <td>
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
            <table>
              <thead>
                <tr style={{ backgroundColor: '#CCCCCC' }}>
                  <th colSpan={2}>Vendor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {
                      vendor.fields.find(
                        (f) => f.templateId === fields.name.templateId,
                      )?.value.string
                    }
                  </td>
                </tr>
                <tr>
                  <td>
                    {
                      vendor.fields.find(
                        (f) =>
                          f.templateId === fields.primaryAddress.templateId,
                      )?.value.string
                    }
                  </td>
                </tr>
                <tr>
                  <td>
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
                    {
                      resource.fields.find(
                        (f) =>
                          f.templateId === fields.shippingAddress.templateId,
                      )?.value.string
                    }
                  </td>
                  <td style={{ width: '50%' }}>
                    <table style={{ width: '100%', border: '0' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '2px', border: '0' }}>
                            <strong>Method</strong>
                          </td>
                          <td style={{ padding: '2px', border: '0' }}>
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
                          <td style={{ padding: '2px', border: '0' }}>
                            <strong>Account #</strong>
                          </td>
                          <td style={{ padding: '2px', border: '0' }}>
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
                          <td style={{ padding: '2px', border: '0' }}>
                            <strong>Incoterms</strong>
                          </td>
                          <td style={{ padding: '2px', border: '0' }}>
                            {
                              resource.fields.find(
                                (f) =>
                                  f.templateId === fields.incoterms.templateId,
                              )?.value.option?.name
                            }
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '2px', border: '0' }}>
                            <strong>Shipping Notes</strong>
                          </td>
                          <td style={{ padding: '2px', border: '0' }}>
                            {
                              resource.fields.find(
                                (f) =>
                                  f.templateId ===
                                  fields.shippingNotes.templateId,
                              )?.value.string
                            }
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
                  <td
                    colSpan={5}
                    style={{ fontWeight: 'bold', backgroundColor: '#C7E1F2' }}
                  >
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
      </html>
    </div>
  )
}
