import { resourceTypes } from '@supplyside/model'
import { notFound } from 'next/navigation'
import { Box, Breadcrumbs, Link, Stack } from '@mui/material'
import NextLink from 'next/link'
import { ResourceTable } from '@/lib/resource/table'
import { readResources } from '@/client/resource'
import { readAccounts } from '@/client/account'
import { readSchema } from '@/client/schema'

export default async function Page({
  params: { accountKey, resourceType: resourceTypeParam },
}: {
  params: { accountKey: string; resourceType: string }
}) {
  const resourceType = resourceTypes.find(
    (rt) => rt.toLowerCase() === resourceTypeParam.toLowerCase(),
  )
  if (!resourceType) return notFound()

  const accounts = await readAccounts()
  const account = accounts?.find((a) => a.key === accountKey)
  if (!account) return notFound()

  const schema = await readSchema(account.id, resourceType)
  if (!schema) return notFound()

  const resources = await readResources(account.id, resourceType, {})
  if (!resources) return notFound()

  return (
    <Stack height="100%">
      <Box px={1.5} py={0.5} borderBottom={1} borderColor="divider">
        <Breadcrumbs sx={{ fontSize: '0.7em', textTransform: 'uppercase' }}>
          <Link
            underline="hover"
            color="inherit"
            href="/accounts"
            component={NextLink}
          >
            Accounts
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href={`/admin/accounts/${account.key}`}
          >
            {account.key}
          </Link>
          <Box color="text.primary">{resourceType}s</Box>
        </Breadcrumbs>
      </Box>
      <Box flexGrow={1} overflow="auto">
        <ResourceTable
          schemaData={schema}
          resources={resources}
          isEditable
          isAdmin
        />
      </Box>
    </Stack>
  )
}
