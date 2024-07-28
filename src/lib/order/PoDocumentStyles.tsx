import React from 'react'

export const PoDocumentStyles: React.FC = () => (
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
      th {
        padding: 4px 8px;
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
      .table-header-bg {
        background-color: #CCCCCC;
      }  
    `}
  </style>
)

export const Border0Padding: React.FC = () => (
  <style>{`.border-0-padding { border: 0; padding: 2px; }`}</style>
)

export const CurrencyPadding: React.FC = () => (
  <style>{`.border-padding-currency { border: '0px', padding: '2px', fontWeight: '600' }`}</style>
)

export const RemovePaddingAndBorder: React.FC = () => (
  <style>{`.remove-padding-border { border-right: 0; border-left: 0; }`}</style>
)

export const BgColorHeader: React.FC = () => (
  <style>{`.bg-color-header { background-color: #CCCCCC; }`}</style>
)
