'use server'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material'
import { ResourceType } from '@prisma/client'
import { map, range } from 'remeda'
import { ExpandMore } from '@mui/icons-material'
import Field from './fields/Field'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'

type Props = {
  resourceType: ResourceType
  resourceKey: number
}

export default async function ResourceFieldsControl({
  resourceType,
  resourceKey,
}: Props) {
  const [systemSchema, customSchema, resource] = await Promise.all([
    readSchema({ resourceType, isSystem: true }),
    readSchema({ resourceType, isSystem: false }),
    readResource({ type: resourceType, key: resourceKey }),
  ])

  return (
    <Stack flexDirection={'row'} gap={2}>
      {splitIntoNParts(3, [
        ...systemSchema.sections,
        ...customSchema.sections,
      ]).map((ss, i) => (
        <Stack key={i} flex={1}>
          {ss.map((s) => (
            <Accordion key={s.id} defaultExpanded variant="outlined">
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" fontWeight={'bold'}>
                  {s.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {s.fields.map((f) => (
                    <Box key={f.id}>
                      <Typography fontWeight={'bold'}>{f.name}</Typography>
                      <Field
                        inputId={`rf-${f.id}`}
                        resourceId={resource.id}
                        field={f}
                        value={
                          resource.fields.find((rf) => rf.fieldId === f.id)
                            ?.value
                        }
                      />
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

/**
 * @param n the number of groups to create
 * @param array the array to split
 * @returns an array of arrays, each containing an approximately equal portion of the original array
 */
const splitIntoNParts = <T,>(n: number, array: T[]): T[][] =>
  map(range(0, n), (i) => array.filter((_, j) => j % n === i))
