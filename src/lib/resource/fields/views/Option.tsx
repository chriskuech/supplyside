import { Chip } from '@mui/material'
import { Option } from '@/domain/schema/types'

type Props = {
  option: Option | null
}

export default function OptionView({ option }: Props) {
  return option && <Chip label={option.name} />
}
