'use client'

import { Tooltip, Button } from '@mui/material'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { useEffect, useState } from 'react'
import ShopIcon from '@mui/icons-material/Shop'
import { createPunchOutServiceRequest } from '@/actions/mcMaster'
import { useDisclosure } from '@/hooks/useDisclosure'

type Props = {
  resource: Resource
}

export default function PunchoutButton({ resource }: Props) {
  const { isOpen, open } = useDisclosure()
  const [punchoutSessionUrl, setPunchoutSessionUrl] = useState(
    () => selectResourceFieldValue(resource, fields.punchoutSessionUrl)?.string,
  )

  useEffect(() => {
    if (!punchoutSessionUrl) {
      createPunchOutServiceRequest(resource.id).then((response) => {
        if (!response) return
        setPunchoutSessionUrl(response.url)
        open()
      })
    }
  })

  return (
    <>
      <Tooltip title="Continue punchout session">
        <Button
          onClick={open}
          size="large"
          color="secondary"
          endIcon={<ShopIcon />}
        >
          Continue Punchout
        </Button>
      </Tooltip>
      {isOpen && punchoutSessionUrl && (
        <iframe
          src={punchoutSessionUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            margin: -1,
            height: '100%',
            width: '100%',
            zIndex: 2000,
          }}
        >
          Your browser does not support iFrames.
        </iframe>
      )}
    </>
  )
}
