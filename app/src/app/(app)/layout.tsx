import {
  Box,
  Card,
  Chip,
  Divider,
  Stack,
  Typography,
  Link,
} from '@mui/material'
import { FC, ReactNode } from 'react'
import {
  Build,
  Business,
  List,
  Receipt,
  ShoppingBag,
  Storefront,
} from '@mui/icons-material'
import { AccountMenu } from '@/lib/ux/appbar/AccountMenu'
import { UserMenu } from '@/lib/ux/appbar/UserMenu'
import { requireSession } from '@/session'
import { readAccount } from '@/client/account'
import { readSelf } from '@/client/user'
import { NavLogo } from '@/lib/ux/appbar/NavLogo'
import { ScrollProvider } from '@/lib/ux/ScrollContext'

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
        <NavLogo />
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
            <ItemLink title="Open Jobs" href="/jobs/open" />
            <ItemLink title="Closed Jobs" href="/jobs/closed" />
            <ItemLink
              title="Lines"
              href="/job-lines"
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
            <ItemLink title="Open Purchases" href="/purchases/open" />
            <ItemLink title="Closed Purchases" href="/purchases/closed" />
            <ItemLink
              title="Lines"
              href="/purchase-lines"
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
            <ItemLink title="Unpaid Bills" href="/bills/unpaid" />
            <ItemLink title="Closed Bills" href="/bills/closed" />
            <ItemLink
              title="Lines"
              href="/bill-lines"
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
        position="relative"
      >
        <ScrollProvider>{children}</ScrollProvider>
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
      component={Link}
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
