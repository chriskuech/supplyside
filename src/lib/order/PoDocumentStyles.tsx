import React from 'react'
import { CSSProperties } from 'react'

export const PoDocumentStyles: React.FC = () => (
  <style>
    {`
      table {
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

const FontSize: CSSProperties = {
  fontWeight: '600',
}

const ShippingCss: CSSProperties = {
  ...FontSize,
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

const TotalAndSubtotalCssClass: CSSProperties = {
  borderRight: 0,
  fontWeight: 'bold',
  verticalAlign: 'top',
}

const PaddingAndBorderTopClass: CSSProperties = {
  borderTop: 0,
  borderBottom: 0,
  padding: '5px 8px',
}

const TopMarginClass: CSSProperties = {
  padding: '5px 8px',
}

const SubtotalAndTotalClass: CSSProperties = {
  backgroundColor: '#C7E1F2',
}

const MarginBottomForTable: CSSProperties = {
  marginBottom: '20px',
}

export const styles = {
  TotalAndSubtotalCssClass,
  PaddingAndBorderTopClass,
  RemovePaddingAndBorder,
  SubtotalAndTotalClass,
  MarginBottomForTable,
  TopMarginClass,
  Border0Padding,
  BgColorHeader,
  TextAlignRightClass,
  PaymentPadding,
  FontSize,
  ShippingCss,
  UnitPriceCSS,
  HeaderCssClass,
}
