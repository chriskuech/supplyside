export type Account = {
  id: string
  key: string
  name: string
  address: string
  logoPath: string | null
}

export type User = {
  id: string
  firstName: string | null
  lastName: string | null
  fullName: string
  email: string
  profilePicPath: string | null
}
