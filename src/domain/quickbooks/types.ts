export type CompanyInfo = {
  CompanyInfo: {
    SyncToken: number
    domain: string
    LegalAddr: {
      City: string
      Country: string
      Line1: string
      PostalCode: string
      CountrySubDivisionCode: string
      Id: string
    }
    SupportedLanguages: string
    CompanyName: string
    Country: string
    CompanyAddr: {
      City: string
      Country: string
      Line1: string
      PostalCode: string
      CountrySubDivisionCode: string
      Id: string
    }
    sparse: boolean
    Id: string
    FiscalYearStartMonth: string
    CustomerCommunicationAddr: {
      City: string
      Country: string
      Line1: string
      PostalCode: string
      CountrySubDivisionCode: string
      Id: string
    }
    PrimaryPhone: {
      FreeFormNumber: string
    }
    LegalName: string
    CompanyStartDate: string
    Email: {
      Address: string
    }
    NameValue: { Name: string; Value: string }
    MetaData: {
      CreateTime: string
      LastUpdatedTime: string
    }
  }
}
