'use client'

import React from 'react'
import Image from 'next/image'
import { MCMASTER_CARR_NAME } from '@supplyside/model'

const MCMASTER_CARR_LOGO_URL = '/mcmaster-carr-logo.png'

export const McMasterCarrLogo = () => (
  <Image
    src={MCMASTER_CARR_LOGO_URL}
    alt={MCMASTER_CARR_NAME}
    height={20}
    width={150}
  />
)
