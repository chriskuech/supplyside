import { User } from '@/domain/iam/user/types'

type Props = {
  user: User | null
}

export default function UserCard({ user }: Props) {
  return (
    <div>
      <h1>{user?.fullName}</h1>
      <p>{user?.email}</p>
    </div>
  )
}
