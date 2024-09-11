export type User = {
  id: string
  accountId: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  email: string
  profilePicPath: string | null
  tsAndCsSignedAt: Date | null
  isApprover: boolean
  isAdmin: boolean
  isGlobalAdmin: boolean
}
