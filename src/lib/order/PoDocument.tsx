/* eslint-disable @next/next/no-head-element */
'use server'

import { ReactNode } from 'react'

export default async function PoDocument(): Promise<ReactNode> {
  return (
    <html>
      <head>
        <style>
          {`
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .header, .footer {
              text-align: center;
              padding: 20px;
              background-color: #f0f0f0;
            }
            .content {
              padding: 20px;
            }
            .content table {
              width: 100%;
              border-collapse: collapse;
            }
            .content table, .content th, .content td {
              border: 1px solid black;
            }
            .content th, .content td {
              padding: 10px;
              text-align: left;
            }
            .page-break {
              page-break-before: always;
            }
            .section {
              margin-bottom: 20px;
            }
          `}
        </style>
      </head>
      <body>
        <div className="header">
          <h1>Purchase Orderrr</h1>
        </div>
        <div className="content">
          <div className="section">
            <table>
              <tr>
                <td>
                  <strong>[LOGO]</strong>
                  <br />
                  ORDER
                </td>
                <td>
                  <strong>PURCHASE</strong>
                  <br />
                  ORDER
                </td>
              </tr>
              <tr>
                <td>
                  Sample Account Name
                  <br />
                  123 Sample Street, Sample City
                </td>
                <td>
                  <table>
                    <tr>
                      <td>Order Key</td>
                      <td>12345</td>
                    </tr>
                    <tr>
                      <td>Revision</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>Issued Date</td>
                      <td>2024-07-18</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          <div className="section">
            <table>
              <tr>
                <td>Notes</td>
                <td>Payment Terms</td>
              </tr>
              <tr>
                <td>Sample order notes</td>
                <td>
                  <table>
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
                  </table>
                </td>
              </tr>
            </table>
          </div>
          <div className="section">
            <table>
              <tr>
                <td>Vendor</td>
                <td>Shipping</td>
              </tr>
              <tr>
                <td>
                  Sample Vendor Name
                  <br />
                  456 Vendor St, Vendor City
                  <br />
                  s/o John Doe
                </td>
                <td>
                  789 Shipping Ave, Shipping City
                  <br />
                  Method: Ground
                  <br />
                  Account #: 987654
                  <br />
                  Incoterms: EXW
                  <br />
                  s/o Jane Doe
                  <br />
                  Shipping Notes: None
                </td>
              </tr>
            </table>
          </div>
          <div className="section">
            <table>
              <thead>
                <tr>
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
                  <td>
                    Sample Item 1<br />
                    <i>Description of item 1</i>
                  </td>
                  <td>pcs</td>
                  <td>10</td>
                  <td>$5.00</td>
                  <td>$50.00</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>
                    Sample Item 2<br />
                    <i>Description of item 2</i>
                  </td>
                  <td>pcs</td>
                  <td>5</td>
                  <td>$10.00</td>
                  <td>$50.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>SUBTOTAL</td>
                  <td>$100.00</td>
                </tr>
                <tr>
                  <td>TOTAL</td>
                  <td>$100.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="footer">Page 1 of 2</div>
          <div className="page-break" />
          <div className="content">
            <div className="section">
              <h2>Terms & Conditions</h2>
              <p>Sample terms and conditions.</p>
            </div>
            <div className="section">
              <table>
                <tr>
                  <td>Approved By:</td>
                  <td>Jane Smith</td>
                </tr>
                <tr>
                  <td>Approved On:</td>
                  <td>2024-07-18</td>
                </tr>
              </table>
            </div>
          </div>
          <div className="footer">Page 2 of 2</div>
        </div>
      </body>
    </html>
  )
}
