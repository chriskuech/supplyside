export type Account = {
  id: string
  name: string
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
