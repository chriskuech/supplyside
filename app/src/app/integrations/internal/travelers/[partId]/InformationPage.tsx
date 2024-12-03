'use client'

import { Box, Divider, Stack, Typography } from '@mui/material'
import {
  fields,
  Resource,
  SchemaData,
  selectResourceFieldValue,
} from '@supplyside/model'
import { ReactNode, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import ReadOnlyFieldsView from './ReadOnlyFieldsView'
import { useEventListener } from '@/hooks/useEventListener'

type Props = {
  job: Resource
  part: Resource
  jobSchemaData: SchemaData
  partSchemaData: SchemaData
  partIndex: number
}

export default function InformationPage({
  job,
  part,
  jobSchemaData,
  partSchemaData,
  partIndex,
}: Props) {
  // Print after a short delay to allow Masonry to render
  useEffect(() => {
    const timeout = setTimeout(() => window.print(), 100)
    return () => clearTimeout(timeout)
  }, [])

  useEventListener('afterprint', () => window.close())

  return (
    <>
      <Box position="relative">
        <Typography variant="h4" textTransform="uppercase">
          Part Traveler
        </Typography>
        <Stack direction="row" spacing={2}>
          <KeyValue label="Job #" value={job.key} />
          <KeyValue label="Part #" value={partIndex + 1} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <KeyValue
            label="Job Status"
            value={
              selectResourceFieldValue(job, fields.jobStatus)?.option?.name ??
              ''
            }
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <KeyValue label="Created Date" value={new Date().toLocaleString()} />
        </Stack>
        <Box position="absolute" top={0} right={0}>
          <QRCodeSVG
            value={window.location.origin + `/jobs/${job.key}`}
            size={100}
          />
        </Box>
      </Box>
      <Divider sx={{ background: 'black' }} />
      <Box>
        <Typography variant="overline">
          Job - {selectResourceFieldValue(job, fields.name)?.string}
        </Typography>
        <ReadOnlyFieldsView schemaData={jobSchemaData} resource={job} />
      </Box>
      <Divider sx={{ height: '1px', background: 'black' }} />
      <Box>
        <Typography variant="overline">
          Part - {selectResourceFieldValue(part, fields.partName)?.string}
        </Typography>
        <ReadOnlyFieldsView schemaData={partSchemaData} resource={part} />
      </Box>
    </>
  )
}

const KeyValue = ({ label, value }: { label: string; value: ReactNode }) => (
  <Box>
    <strong>{label}:</strong> {value}
  </Box>
)
