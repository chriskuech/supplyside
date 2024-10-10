'use client'

import { Tooltip, IconButton } from '@mui/material'
import {
  fields,
  Resource,
  resources,
  selectResourceFieldValue,
} from '@supplyside/model'
import { useEffect, useState } from 'react'
import ShopIcon from '@mui/icons-material/Shop'
import { createPunchOutServiceRequest } from '@/actions/mcMaster'
import { useDisclosure } from '@/hooks/useDisclosure'

type Props = {
  purchaseHasLines: boolean
  resource: Resource
}

export default function PunchoutControl({ resource, purchaseHasLines }: Props) {
  const { isOpen, open } = useDisclosure()
  const [punchoutSessionUrl, setPunchoutSessionUrl] = useState(
    () => selectResourceFieldValue(resource, fields.punchoutSessionUrl)?.string,
  )

  useEffect(() => {
    const vendorTemplateId = selectResourceFieldValue(resource, fields.vendor)
      ?.resource?.templateId
    const isVendorMcMasterCarr =
      vendorTemplateId === resources.mcMasterCarrVendor.templateId

    if (isVendorMcMasterCarr && !purchaseHasLines && !punchoutSessionUrl) {
      createPunchOutServiceRequest(resource.id).then((response) => {
        if (!response) return
        setPunchoutSessionUrl(response.url)
        open()
      })
    }
  })

  return (
    !!punchoutSessionUrl &&
    !purchaseHasLines && (
      <>
        <Tooltip title="Continue punchout session">
          <IconButton onClick={open}>
            <ShopIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        {isOpen && punchoutSessionUrl && (
          // TODO: change top and height when moving appBar to side
          <iframe
            src={punchoutSessionUrl}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 64px)',
              zIndex: 2000,
            }}
          >
            Your browser does not support iFrames.
          </iframe>
        )}
      </>
    )
  )
}
