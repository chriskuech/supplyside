import { Clear, Edit } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from '@mui/material'
import { FC, useEffect, useState } from 'react'
import AddressCard from '../views/AddressCard'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import { Address } from '@/domain/resource/entity'

export type AddressFieldProps = {
  address: Address | null
  onChange: (address: Address | null) => void
  inline?: boolean
  disabled?: boolean
}

export default function AddressField({
  address,
  onChange,
  inline,
  disabled,
}: AddressFieldProps) {
  const { isOpen, open, close } = useDisclosure()

  return (
    <>
      <Dialog onClose={close} open={isOpen}>
        <DialogTitle>Edit Address</DialogTitle>
        <DialogContent>
          <AddressForm
            address={address}
            onChange={(dto) => {
              close()
              onChange(dto)
            }}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>
      {address ? (
        <Stack spacing={1}>
          <AddressCard address={address} inline={inline} />
          <Stack
            spacing={1}
            direction="row"
            justifyContent="end"
            alignItems="center"
          >
            <IconButton size="small" onClick={open} disabled={disabled}>
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onChange(null)}
              disabled={disabled}
            >
              <Clear />
            </IconButton>
          </Stack>
        </Stack>
      ) : (
        <Button variant="text" onClick={open} disabled={disabled}>
          Add Address
        </Button>
      )}
    </>
  )
}

type AddressFormProps = {
  address: Address | null
  onChange: (address: Address | null) => void
  onCancel: () => void
}

const AddressForm: FC<AddressFormProps> = ({ address, onChange, onCancel }) => {
  const [dto, setDto] = useState<Address>({
    streetAddress: null,
    city: null,
    state: null,
    zip: null,
    country: null,
  })

  useEffect(() => {
    setDto({
      streetAddress: address?.streetAddress?.trim() || null,
      city: address?.city?.trim() || null,
      state: address?.state?.trim() || null,
      zip: address?.zip?.trim() || null,
      country: address?.country?.trim() || null,
    })
  }, [address])

  const handleSave = () => {
    const isAddressEmpty = Object.values(dto).every((value) => value === null)

    if (isAddressEmpty) {
      onChange(null)
    } else {
      onChange(dto)
    }

    onCancel()
  }

  return (
    <Stack spacing={2} pt={2}>
      <TextField
        label="Street Address"
        value={dto.streetAddress}
        onChange={({ target: { value } }) =>
          setDto((prev) => ({ ...prev, streetAddress: value }))
        }
      />
      <TextField
        label="City"
        value={dto.city}
        onChange={({ target: { value } }) =>
          setDto((prev) => ({ ...prev, city: value }))
        }
      />
      <TextField
        label="State"
        value={dto.state}
        onChange={({ target: { value } }) =>
          setDto((prev) => ({ ...prev, state: value }))
        }
      />
      <TextField
        label="Zip"
        value={dto.zip}
        onChange={({ target: { value } }) =>
          setDto((prev) => ({ ...prev, zip: value }))
        }
      />
      <TextField
        label="Country"
        value={dto.country}
        onChange={({ target: { value } }) =>
          setDto((prev) => ({ ...prev, country: value }))
        }
      />
      <Stack spacing={1} direction="row" justifyContent="end">
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" onClick={handleSave}>
          Save
        </Button>
      </Stack>
    </Stack>
  )
}
