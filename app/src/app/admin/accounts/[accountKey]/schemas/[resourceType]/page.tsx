import { notFound } from 'next/navigation'
import { resourceTypes } from '@supplyside/model'
import YAML from 'yaml'
import { Box, Breadcrumbs, Link, Stack } from '@mui/material'
import NextLink from 'next/link'
import { ClientEditor } from './ClientEditor'
import { readAccounts } from '@/client/account'
import { readSchema } from '@/client/schema'

export default async function SchemasPage({
  params,
}: {
  params: { accountKey: string; resourceType: string }
}) {
  const resourceType = resourceTypes.find(
    (rt) => rt.toLowerCase() === params.resourceType.toLowerCase(),
  )
  if (!resourceType) return notFound()

  const accounts = await readAccounts()
  const account = accounts?.find((a) => a.key === params.accountKey)
  if (!account) return notFound()

  const schema = await readSchema(account.id, resourceType)
  if (!schema) return notFound()

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

      <ClientEditor
        language="yaml"
        value={YAML.stringify(schema, null, 2)}
        options={{ readOnly: true }}
        height="100%"
      />
    </Stack>
  )
}
