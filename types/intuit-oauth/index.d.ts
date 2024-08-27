// Got this types from https://github.com/intuit/oauth-jsclient/issues/33
// there may be some inconsistencies with the current implementation

declare module 'intuit-oauth' {
  interface TokenData {
    realmId?: string
    token_type?: string
    access_token?: string
    refresh_token?: string
    expires_in: number
    x_refresh_token_expires_in: number
    id_token?: string
    latency: number
    createdAt: string
  }

  export class Token implements TokenData {
    latency: number

    realmId: string

    token_type: string

    access_token: string

    refresh_token: string

    expires_in: number

    x_refresh_token_expires_in: number

    id_token: string

    createdAt: number

    state?: string
  }

  class AuthResponse<Response extends Record<string, unknown>> {
    constructor(params: AuthResponse.AuthResponseParams)

    processResponse(response: Record<string, unknown>): void

    token: Token

    text(): string

    status(): number

    headers(): Record<string, unknown>

    valid(): boolean

    json: Response

    get_intuit_tid(): string

    isContentType(): boolean

    getContentType(): string

    isJson(): boolean
  }

  namespace AuthResponse {
    interface AuthResponseParams {
      token?: Token
      response?: Response
      body?: string
      json?: Record<string, unknown>
      intuit_tid?: string
    }
  }

  class OAuthClient {
    constructor(config: OAuthClient.OAuthClientConfig)

    token: Token

    authHeader(): string

    authorizeUri(params: OAuthClient.AuthorizeParams): string

    createError(
      e: Error,
      authResponse?: AuthResponse,
    ): OAuthClient.OAuthClientError

    createToken(uri: string): Promise<AuthResponse>

    getKeyFromJWKsURI(
      id_token: string,
      kid: string,
      request: Request,
    ): Promise<Record<string, unknown> | string>

    getTokenRequest(request: Request): Promise<AuthResponse>

    getUserInfo(): Promise<AuthResponse>

    isAccessTokenValid(): boolean

    loadResponse(request: Request): Promise<Response>

    loadResponseFromJWKsURI(request: Request): Promise<Response>

    log(level: string, message: string, messageData: unknown): void

    makeApiCall<Response>(
      params?: OAuthClient.MakeApiCallParams,
    ): Promise<AuthResponse<Response>>

    refresh(): Promise<AuthResponse>

    refreshUsingToken(refresh_token: string): Promise<AuthResponse>

    revoke(params?: OAuthClient.RevokeParams): Promise<AuthResponse>

    setToken(params: TokenData): Token

    validateIdToken(
      params?: OAuthClient.ValidateIdTokenParams,
    ): Promise<Response>

    validateToken(): void
  }

  namespace OAuthClient {
    interface OAuthClientConfig {
      clientId: string
      clientSecret: string
      redirectUri?: string
      environment?: string
      token?: Token
      logging?: boolean
    }

    enum scopes {
      Accounting = 'com.intuit.quickbooks.accounting',
      Payment = 'com.intuit.quickbooks.payment',
      Payroll = 'com.intuit.quickbooks.payroll',
      TimeTracking = 'com.intuit.quickbooks.payroll.timetracking',
      Benefits = 'com.intuit.quickbooks.payroll.benefits',
      Profile = 'profile',
      Email = 'email',
      Phone = 'phone',
      Address = 'address',
      OpenId = 'openid',
      Intuit_name = 'intuit_name',
    }

    interface AuthorizeParams {
      scope: scopes | scopes[] | string
      state: string
    }

    interface RevokeParams {
      access_token?: string
      refresh_token?: string
    }

    interface MakeApiCallParams {
      url: string
      method: string
      headers?: Record<string, unknown>
      body?: string
    }

    interface ValidateIdTokenParams {
      id_token?: string
    }

    interface OAuthClientError extends Error {
      intuit_tid: string
      authResponse: AuthResponse
      originalMessage: string
      error_description: string
    }
  }

  // Response types

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

  export = OAuthClient
}
