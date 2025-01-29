import { Box, Container, Stack } from '@mui/material'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import { notFound } from 'next/navigation'
import { sortBy } from 'remeda'
import OperationsTable from './OperationsTable'
import InformationPage from './InformationPage'
import { requireSession } from '@/session'
import { readResource, readResources } from '@/client/resource'
import { readSchema } from '@/client/schema'

export const metadata = {
  title: 'Part Traveler',
}

export default async function TravelersPage({
  params: { partId },
}: {
  params: { partId: string }
}) {
  const { accountId } = await requireSession()

  const part = await readResource(accountId, partId)
  if (!part) return notFound()

  const jobReference = selectResourceFieldValue(part, fields.job)?.resource
  if (!jobReference) return notFound()

  const job = await readResource(accountId, jobReference.id)
  if (!job) return notFound()

  const unorderedParts = await readResources(accountId, 'Part', {
    where: {
      '==': [{ var: fields.job.name }, job.id],
    },
  })
  if (!unorderedParts) return notFound()

  const parts = sortBy(unorderedParts, (part) => part.createdAt)
  const partIndex = parts.findIndex((part) => part.id === partId)
  if (partIndex === -1) throw new Error('Part not found')

  const [jobSchemaData, partSchemaData] = await Promise.all([
    readSchema(accountId, 'Job'),
    readSchema(accountId, 'Part'),
  ])
  if (!jobSchemaData || !partSchemaData) return notFound()

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      bgcolor="#eee"
      color="black"
    >
      <style>{`@media print { @page { size: landscape; } }`}</style>

      <Container
        sx={{
          my: 2,
          backgroundColor: 'white',
          color: 'black',
          '@media print': {
            '&': { p: 0 },
          },
        }}
      >
        <Stack
          p="0.5in"
          sx={{
            '@media print': {
              '&': { p: 0 },
            },
          }}
          spacing={0.5}
        >
          <InformationPage
            job={job}
            part={part}
            jobSchemaData={jobSchemaData}
            partSchemaData={partSchemaData}
            partIndex={partIndex}
          />
          <Box sx={{ '&': { pageBreakAfter: 'always' } }} />
          <OperationsTable accountId={accountId} partId={partId} />
        </Stack>
      </Container>
    </Box>
  )
}
