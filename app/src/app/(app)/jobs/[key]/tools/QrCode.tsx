'use client'

import { Popover, Stack, Tooltip } from '@mui/material'
import { QrCode2 } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import { FC, useState } from 'react'

type Props = {
  fontSize: 'small' | 'medium' | 'large'
}

export const QrCode: FC<Props> = ({ fontSize }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  return (
    <>
      <Tooltip title="View the QR Code link to this page">
        <IconButton
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            setAnchorEl(event.currentTarget)
          }
          size="small"
        >
          <QrCode2 fontSize={fontSize} />
        </IconButton>
      </Tooltip>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack p={1} bgcolor="white">
          <QRCodeSVG value={window.location.href} size={250} />
        </Stack>
      </Popover>
    </>
  )
}
