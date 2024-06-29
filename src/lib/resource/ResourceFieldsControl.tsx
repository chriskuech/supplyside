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
import { chunk, range } from 'remeda'
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
    <Box>
      {[...systemSchema.sections, ...customSchema.sections].map((s, i) => (
        <Accordion key={s.id} defaultExpanded={i === 0} variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={'bold'}>
              {s.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2} direction={'row'}>
              {chunkByN(s.fields, 3).map((fs, i) => (
                <Stack key={i} spacing={2} flex={1}>
                  {fs.map((f) => (
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
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

const chunkByN = <T,>(arr: T[], n: number): T[][] => {
  const chunks = chunk(arr, Math.ceil(arr.length / n))
  const fill = range(chunks.length, n).map(() => [])

  return [...chunks, ...fill]
}
