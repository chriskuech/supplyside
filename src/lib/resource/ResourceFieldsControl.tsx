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
import { map, pipe, range } from 'remeda'
import dynamic from 'next/dynamic'
import { ExpandMore } from '@mui/icons-material'
import { readResource } from '@/domain/resource/actions'
import { readUsers, updateValue } from '@/domain/resource/fields/actions'
import { readSchema } from '@/domain/schema/actions'

const ResourceFieldControl = dynamic(() => import('./ResourceFieldControl'), {
  ssr: false,
})

type Props = {
  resourceType: ResourceType
  resourceKey: number
}

export default async function ResourceFieldsControl({
  resourceType,
  resourceKey,
}: Props) {
  const [systemSchema, customSchema, resource, users] = await Promise.all([
    readSchema({ resourceType, isSystem: true }),
    readSchema({ resourceType, isSystem: false }),
    readResource({ type: resourceType, key: resourceKey }),
    readUsers(),
  ])

  return (
    <Stack flexDirection={'row'} gap={2}>
      {splitIntoNParts(3, [
        ...systemSchema.sections,
        ...customSchema.sections,
      ]).map((ss, i) => (
        <Stack key={i} flex={1} spacing={2}>
          {ss.map((s) => (
            <Accordion key={s.id} defaultExpanded>
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
                      <ResourceFieldControl
                        id={`rf-${f.id}`}
                        resourceId={resource.id}
                        field={f}
                        users={users}
                        value={
                          resource.fields.find((rf) => rf.fieldId === f.id)
                            ?.value
                        }
                        onChange={updateValue}
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

const splitIntoNParts = <T,>(n: number, array: T[]): T[][] => {
  const partSize = Math.ceil(array.length / n)
  return pipe(
    range(0, n),
    map((i) => array.slice(i * partSize, (i + 1) * partSize)),
  )
}
