import React, { FC } from 'react'
import { CSSProperties } from 'react'

export const PoDocumentStyles: FC = () => (
  <style>
    {`
      table {
        height: 100%;
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 0px;
      }
      th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      th {
        padding: 4px 8px;
      }
    `}
  </style>
)

export const Border0Padding: CSSProperties = {
  border: '0px',
  padding: '2px',
  paddingLeft: '8px',
  paddingRight: '8px',
}

export const RemovePaddingAndBorder: CSSProperties = {
  borderRight: 0,
  borderLeft: 0,
}

export const BgColorHeader: CSSProperties = {
  backgroundColor: '#CCCCCC',
}

const TextAlignRightClass: CSSProperties = {
  textAlign: 'right',
  padding: '2px 8px',
}

const PaymentPadding: CSSProperties = {
  ...Border0Padding,
  ...TextAlignRightClass,
}

const ShippingCss: CSSProperties = {
  fontWeight: '600',
  ...Border0Padding,
  verticalAlign: 'top',
}

const UnitPriceCSS: CSSProperties = {
  ...TextAlignRightClass,
  ...RemovePaddingAndBorder,
}

const HeaderCssClass: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
}

const MarginBottomForTable: CSSProperties = {
  marginBottom: '20px',
}

export const styles = {
  RemovePaddingAndBorder,
  MarginBottomForTable,
  Border0Padding,
  BgColorHeader,
  PaymentPadding,
  ShippingCss,
  UnitPriceCSS,
  HeaderCssClass,
}
