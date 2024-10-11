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
              title="New Jobs"
              href="/jobs?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%2245071e3b-1fa0-4517-9676-e120d59c0822%22%2C%22operator%22%3A%22isAnyOf%22%2C%22id%22%3A78408%2C%22value%22%3A%5B%22Draft%22%2C%22Quoted%22%5D%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
            />
            <ItemLink
              title="Open Jobs"
              href="/jobs?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%2245071e3b-1fa0-4517-9676-e120d59c0822%22%2C%22operator%22%3A%22isAnyOf%22%2C%22id%22%3A78408%2C%22value%22%3A%5B%22Ordered%22%2C%22In%20Process%22%2C%22Shipped%22%2C%22Invoiced%22%5D%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
            />
            <ItemLink
              title="Invoiced"
              href="/jobs?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%2245071e3b-1fa0-4517-9676-e120d59c0822%22%2C%22operator%22%3A%22isAnyOf%22%2C%22id%22%3A78408%2C%22value%22%3A%5B%22Invoiced%22%5D%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
            />
            <ItemLink
              title="Paid"
              href="/jobs?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%2245071e3b-1fa0-4517-9676-e120d59c0822%22%2C%22operator%22%3A%22isAnyOf%22%2C%22id%22%3A78408%2C%22value%22%3A%5B%22Paid%22%5D%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
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
              href="/purchases?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%222e96b5eb-ce9e-4600-baaa-b166ca1cfc00%22%2C%22operator%22%3A%22isAnyOf%22%2C%22id%22%3A66054%2C%22value%22%3A%5B%22Draft%22%2C%22Submitted%22%2C%22Approved%22%2C%22Purchased%22%5D%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
            />
            <ItemLink
              title="Received"
              href="/purchases?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%222e96b5eb-ce9e-4600-baaa-b166ca1cfc00%22%2C%22operator%22%3A%22isAnyOf%22%2C%22id%22%3A66054%2C%22value%22%3A%5B%22Received%22%5D%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
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
              title="New Bills"
              href="/bills?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%2214be6f56-c5af-48e7-be69-303439197029%22%2C%22operator%22%3A%22isAnyOf%22%2C%22id%22%3A38677%2C%22value%22%3A%5B%22Draft%22%5D%2C%22fromInput%22%3A%22%3Ar5b%3A%22%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
            />
            <ItemLink
              title="Unpaid Bills"
              href="/bills?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%2214be6f56-c5af-48e7-be69-303439197029%22%2C%22operator%22%3A%22doesNotEqual%22%2C%22id%22%3A38677%2C%22value%22%3A%22Paid%22%2C%22fromInput%22%3A%22%3Ar6s%3A%22%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
            />
            <ItemLink
              title="Paid Bills"
              href="/bills?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%2214be6f56-c5af-48e7-be69-303439197029%22%2C%22operator%22%3A%22equals%22%2C%22id%22%3A38677%2C%22value%22%3A%22Paid%22%2C%22fromInput%22%3A%22%3Ar6s%3A%22%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
            />
            <ItemLink
              title="Lines"
              href="/purchaselines?filter=%7B%22items%22%3A%5B%7B%22field%22%3A%226a7ee1c3-2b17-4e0a-9d98-1f7e8635a2e5%22%2C%22operator%22%3A%22isNotEmpty%22%2C%22id%22%3A69842%7D%5D%2C%22quickFilterValues%22%3A%5B%5D%7D"
              icon={<List fontSize="small" />}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Inventory
          </Typography>
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
        </Box>

        <Box flexGrow={1} />

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
