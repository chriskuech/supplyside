import Link from 'next/link'
import Logo from './Logo'

type Props = {
  href?: string
}

export const NavLogo = ({ href = '/' }: Props) => (
  <Link href={href}>
    <Logo />
  </Link>
)
