import { Box, Card, Chip, Divider, Stack, Typography } from '@mui/material'
import NextLink from 'next/link'
import { FC, ReactNode } from 'react'
import {
  Build,
  Business,
  List,
  Receipt,
  ShoppingBag,
  Storefront,
  Widgets,
} from '@mui/icons-material'
import Logo from '@/lib/ux/appbar/Logo'
import { AccountMenu } from '@/lib/ux/appbar/AccountMenu'
import { UserMenu } from '@/lib/ux/appbar/UserMenu'
import { requireSession } from '@/session'
import { readAccount } from '@/client/account'
import { readSelf } from '@/client/user'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, accountId } = await requireSession()
  const [user, account] = await Promise.all([
    userId && readSelf(userId),
    accountId && readAccount(accountId),
  ])

  return (
    <Stack direction="row" height="100vh" width="100vw">
      <Stack width="min-content" m={2} spacing={2}>
        <Logo />

        <Box>
          <Typography variant="overline" color="text.secondary">
            Jobs
          </Typography>
          <Box>
            <ItemLink
              title="All Jobs"
              href="/jobs"
              icon={<Build fontSize="small" />}
            />
            <ItemLink
              title="Open Jobs"
              href='/jobs?filter=%7B"items"%3A%5B%7B"field"%3A"45071e3b-1fa0-4517-9676-e120d59c0822"%2C"operator"%3A"isAnyOf"%2C"id"%3A91182%2C"value"%3A%5B"2fdc9fdd-e8a5-4f85-ac54-53e1c283c8c1"%2C"676a1fbd-3ac6-40f1-b85e-21b5bc04536a"%2C"733b4f1d-57de-402a-ad34-65125aa828f7"%2C"c363420a-eecc-4ed0-9cdb-e264d8a8004e"%2C"a3011ed0-618b-4bed-b1d8-f5bdfd4c9925"%5D%7D%5D%2C"quickFilterValues"%3A%5B%5D%7D'
            />
            <ItemLink
              title="Closed Jobs"
              href='/jobs?filter=%7B"items"%3A%5B%7B"field"%3A"45071e3b-1fa0-4517-9676-e120d59c0822"%2C"operator"%3A"isAnyOf"%2C"id"%3A91182%2C"value"%3A%5B"97b63da6-6811-4b6a-a4ca-bd8d0a2a4323"%2C"5e42f169-a781-4669-8008-ed619066ee10"%5D%7D%5D%2C"quickFilterValues"%3A%5B%5D%7D'
            />
            <ItemLink
              title="Lines"
              href="/joblines"
              icon={<List fontSize="small" />}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Purchases
          </Typography>
          <Box>
            <ItemLink
              title="All Purchases"
              href="/purchases"
              icon={<ShoppingBag fontSize="small" />}
            />
            <ItemLink
              title="Open Purchases"
              href='/purchases?filter=%7B"items"%3A%5B%7B"field"%3A"2e96b5eb-ce9e-4600-baaa-b166ca1cfc00"%2C"operator"%3A"isAnyOf"%2C"id"%3A79188%2C"value"%3A%5B"d71a14c4-8e37-4546-a5fe-38c93bcd26e9"%2C"26b564b8-42d7-4bbc-b27a-2cb96cce19b8"%2C"6bb96a3a-9bdb-4d39-a028-ec3e18183237"%2C"4d76a126-7945-420f-b81a-2c39081318a7"%5D%7D%5D%2C"quickFilterValues"%3A%5B%5D%7D'
            />
            <ItemLink
              title="Closed Purchases"
              href='/purchases?filter=%7B"items"%3A%5B%7B"field"%3A"2e96b5eb-ce9e-4600-baaa-b166ca1cfc00"%2C"operator"%3A"isAnyOf"%2C"id"%3A79188%2C"value"%3A%5B"d704f4b9-6f2d-4c11-931b-bfe298adec35"%2C"c98639c7-ecc9-4f93-93d3-24c467761bcc"%5D%7D%5D%2C"quickFilterValues"%3A%5B%5D%7D'
            />
            <ItemLink
              title="Lines"
              href="/purchaselines?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%222a100a8d-2efb-47d6-8904-133784915868%22%2C%22operator%22%3A%22isNotEmpty%22%2C%22id%22%3A69842%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
              icon={<List fontSize="small" />}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Bills
          </Typography>
          <Box>
            <ItemLink
              title="All Bills"
              href="/bills"
              icon={<Receipt fontSize="small" />}
            />
            <ItemLink
              title="Unpaid Bills"
              href='/bills?filter=%7B"items"%3A%5B%7B"field"%3A"14be6f56-c5af-48e7-be69-303439197029"%2C"operator"%3A"isAnyOf"%2C"id"%3A32869%2C"value"%3A%5B"1fab6b3c-aa21-457f-aa55-4eebeac60b76"%2C"bef7fae8-1e82-433c-ac5e-31e5c43763e9"%2C"ab178575-e75d-45de-a905-72153c72fa7c"%5D%7D%5D%2C"quickFilterValues"%3A%5B%5D%7D'
            />
            <ItemLink
              title="Closed Bills"
              href='/bills?filter=%7B"items"%3A%5B%7B"field"%3A"14be6f56-c5af-48e7-be69-303439197029"%2C"operator"%3A"isAnyOf"%2C"id"%3A32869%2C"value"%3A%5B"ba775746-a2ba-4ef9-b20e-3a611f5581bd"%2C"93a44743-2890-49d8-9087-87d92d6dea7d"%5D%7D%5D%2C"quickFilterValues"%3A%5B%5D%7D'
            />
            <ItemLink
              title="Lines"
              href="/purchaselines?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%226a7ee1c3-2b17-4e0a-9d98-1f7e8635a2e5%22%2C%22operator%22%3A%22isNotEmpty%22%2C%22id%22%3A69842%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
              icon={<List fontSize="small" />}
            />
          </Box>
        </Box>

        <Box flexGrow={1} />

        <Box>
          <ItemLink
            icon={<Business fontSize="small" />}
            title="Customers"
            href="/customers"
          />
          <ItemLink
            icon={<Storefront fontSize="small" />}
            title="Vendors"
            href="/vendors"
          />
          <ItemLink
            icon={<Widgets fontSize="small" />}
            title="Parts"
            href="/parts"
          />
        </Box>

        <Divider />
        <Stack direction="row" justifyContent="space-evenly">
          {account && <AccountMenu />}
          {user && <UserMenu self={user} />}
        </Stack>
      </Stack>
      <Card
        component={Box}
        flexGrow={1}
        margin={1}
        borderRadius={1}
        elevation={0}
        variant="elevation"
      >
        <Box height="100%" width="100%" overflow="auto">
          {children}
        </Box>
      </Card>
    </Stack>
  )
}

const ItemLink: FC<{
  title: string
  href: string
  icon?: ReactNode
  count?: number
}> = ({ title, href, icon, count }) => (
  <Box
    marginLeft={!icon ? 2 : undefined}
    paddingLeft={!icon ? 2 : undefined}
    borderLeft={!icon ? '1px solid' : undefined}
    borderColor="divider"
  >
    <Typography
      display="flex"
      flexDirection="row"
      component={NextLink}
      href={href}
      color="text.secondary"
      fontSize="0.8em"
      alignItems="center"
      sx={{
        textDecoration: 'none',
        '&:hover': {
          color: 'text.primary',
        },
      }}
      lineHeight="1.7em"
    >
      {icon && (
        <Box
          width={33}
          height="min-content"
          textAlign="center"
          lineHeight={1}
          sx={{ verticalAlign: 'middle' }}
        >
          {icon}
        </Box>
      )}
      {title}
      <Box flexGrow={1} />
      {!!count && <Chip label={count} size="small" color="primary" />}
    </Typography>
  </Box>
)
