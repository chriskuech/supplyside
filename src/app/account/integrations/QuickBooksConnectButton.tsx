'use client'

import { Link } from '@mui/material'
import Image from 'next/image'
import { useDisclosure } from '@/lib/hooks/useDisclosure'

type Props = {
  url: string
}

export default function QuickBooksConnectButton({ url }: Props) {
  const {
    isOpen: isHover,
    open: onMouseEnter,
    close: onMouseLeave,
  } = useDisclosure()

  const src = isHover
    ? '/C2QB_green_btn_tall_hover.svg'
    : '/C2QB_green_btn_tall_default.svg'

  return (
    <Link
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      href={url}
    >
      <Image width={274} height={48} src={src} alt="Connect QuickBooks" />
    </Link>
  )
}
