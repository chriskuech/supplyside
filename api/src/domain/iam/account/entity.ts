export type Account = {
  id: string
  key: string
  name: string
  address: string
  logoPath: string | null
  logoBlobId: string | null
  quickBooksConnectedAt: Date | null
  plaidConnectedAt: Date | null
  mcMasterCarrConnectedAt: Date | null
}
