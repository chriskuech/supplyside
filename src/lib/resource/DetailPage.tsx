'use server'

import { Button, Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import ResourceTable from './ResourceTable'
import { requireSessionWithRedirect } from '@/lib/session'
import { readResources, createResource } from '@/domain/resource/actions'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readSchema } from '@/domain/schema/actions'
import { createPo } from '@/domain/order/createPo'

const CreateResourceButton = dynamic(() => import('./CreateResourceButton'), {
  ssr: false,
})

export default async function DetailPage({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()

  const [schema, resources] = await Promise.all([
    readSchema({
      resourceType: 'Line',
    }),
    readResources({
      type: 'Line',
    }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography variant="h3">
              <span style={{ fontWeight: 100 }}>Order #</span>
              <span style={{ fontWeight: 700 }}>{key}</span>
            </Typography>
            <Button onClick={() => createPo()}>Create PO</Button>
          </Stack>
          <ResourceFieldsControl
            resourceType={'Order'}
            resourceKey={Number(key)}
          />
        </Stack>
        <Stack spacing={2}>
          <Stack direction={'row'} alignItems={'end'}>
            <Typography variant="h4" flexGrow={1}>
              Lines
            </Typography>
            <CreateResourceButton
              type={'Line'}
              createResource={createResource}
            />
          </Stack>
          <ResourceTable schema={schema} resources={resources} />
        </Stack>
      </Stack>
    </Container>
  )
}
