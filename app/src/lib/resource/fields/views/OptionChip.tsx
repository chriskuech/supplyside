import { Chip, ChipProps } from '@mui/material'
import { fields, Option } from '@supplyside/model'
import { isTruthy } from 'remeda'

type Props = {
  option: Option
} & ChipProps

export default function OptionChip({ option, ...other }: Props) {
  const color = Object.values(fields)
    .filter((field) => ['Select', 'MultiSelect'].includes(field.type))
    .flatMap((field) => field.options)
    .filter(isTruthy)
    .find(
      (optionTemplate) =>
        !!option.templateId && optionTemplate.templateId === option.templateId,
    )?.color

  return (
    <Chip
      {...other}
      label={option.name}
      sx={{ backgroundColor: color, color: color ? 'black' : undefined }}
    />
  )
}
