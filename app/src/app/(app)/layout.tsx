import assert from 'assert'
import { Box, Card, Divider, Stack, Typography } from '@mui/material'
import {
  Build,
  Business,
  List,
  PrecisionManufacturing,
  Receipt,
  ShoppingBag,
  Speed,
  Storefront,
  ViewTimelineOutlined,
} from '@mui/icons-material'
import {
  OptionTemplate,
  billStatusOptions,
  fields,
  jobStatusOptions,
  purchaseStatusOptions,
  selectSchemaFieldOptionUnsafe,
} from '@supplyside/model'
import { ItemLink } from './NavItem'
import { AccountMenu } from '@/lib/ux/appbar/AccountMenu'
import { UserMenu } from '@/lib/ux/appbar/UserMenu'
import { requireSession } from '@/session'
import { readAccount, readAccounts } from '@/client/account'
import { readSelf } from '@/client/user'
import { NavLogo } from '@/lib/ux/appbar/NavLogo'
import { ScrollProvider } from '@/lib/ux/ScrollContext'
import { readResources } from '@/client/resource'
import { readSchema } from '@/client/schema'
import AdminMenu from '@/lib/ux/appbar/AdminMenu'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, accountId } = await requireSession()
  const [user, account, accounts, jobSchema, purchaseSchema, billSchema] =
    await Promise.all([
      readSelf(userId),
      readAccount(accountId),
      readAccounts(),
      readSchema(accountId, 'Job'),
      readSchema(accountId, 'Purchase'),
      readSchema(accountId, 'Bill'),
    ])

  assert(jobSchema && purchaseSchema && billSchema)

  const jobStatusOptionId = (optionRef: OptionTemplate) =>
    selectSchemaFieldOptionUnsafe(jobSchema, fields.jobStatus, optionRef).id
  const purchaseStatusOptionId = (optionRef: OptionTemplate) =>
    selectSchemaFieldOptionUnsafe(
      purchaseSchema,
      fields.purchaseStatus,
      optionRef,
    ).id
  const billStatusOptionId = (optionRef: OptionTemplate) =>
    selectSchemaFieldOptionUnsafe(billSchema, fields.billStatus, optionRef).id

  const gettingOpenJobs = readResources(accountId, 'Job', {
    where: {
      and: [
        {
          '!=': [
            { var: fields.jobStatus.name },
            jobStatusOptionId(jobStatusOptions.paid),
          ],
        },
        {
          '!=': [
            { var: fields.jobStatus.name },
            jobStatusOptionId(jobStatusOptions.canceled),
          ],
        },
      ],
    },
  })

  const gettingInProcessJobs = readResources(accountId, 'Job', {
    where: {
      '==': [
        { var: fields.jobStatus.name },
        jobStatusOptionId(jobStatusOptions.inProcess),
      ],
    },
  })

  const gettingOpenPurchases = readResources(accountId, 'Purchase', {
    where: {
      and: [
        {
          '!=': [
            { var: fields.purchaseStatus.name },
            purchaseStatusOptionId(purchaseStatusOptions.received),
          ],
        },
        {
          '!=': [
            { var: fields.purchaseStatus.name },
            purchaseStatusOptionId(purchaseStatusOptions.canceled),
          ],
        },
      ],
    },
  })

  const gettingUnpaidBills = readResources(accountId, 'Bill', {
    where: {
      and: [
        {
          '!=': [
            { var: fields.billStatus.name },
            billStatusOptionId(billStatusOptions.paid),
          ],
        },
        {
          '!=': [
            { var: fields.billStatus.name },
            billStatusOptionId(billStatusOptions.canceled),
          ],
        },
      ],
    },
  })

  const openJobCount = (await gettingOpenJobs)?.length ?? 0
  const inProcessJobCount = (await gettingInProcessJobs)?.length ?? 0
  const openPurchaseCount = (await gettingOpenPurchases)?.length ?? 0
  const unpaidBillCount = (await gettingUnpaidBills)?.length ?? 0

  return (
    <Stack direction="row" height="100vh" width="100vw">
      <Stack width="min-content" m={2} spacing={2}>
        <NavLogo />
        <Box>
          <ItemLink
            icon={<Speed fontSize="small" />}
            title="Dashboard"
            href="/dashboard"
          />
        </Box>
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
              href="/jobs/open"
              count={openJobCount}
            />
            <ItemLink
              title="In Process Jobs"
              href="/jobs/in-process"
              count={inProcessJobCount}
            />
            <ItemLink title="Closed Jobs" href="/jobs/closed" />
            <ItemLink
              title="Jobs Schedule"
              href="/jobs/schedule"
              icon={<ViewTimelineOutlined fontSize="small" />}
            />
            <ItemLink
              title="Lines"
              href="/jobs/lines"
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
              href="/purchases/open"
              count={openPurchaseCount}
            />
            <ItemLink title="Closed Purchases" href="/purchases/closed" />
            <ItemLink
              title="Lines"
              href="/purchases/lines"
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
              href="/bills/unpaid"
              count={unpaidBillCount}
            />
            <ItemLink title="Closed Bills" href="/bills/closed" />
            <ItemLink
              title="Lines"
              href="/bills/lines"
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
          {user?.isGlobalAdmin && (
            <ItemLink
              icon={<PrecisionManufacturing fontSize="small" />}
              title="Work Centers"
              href="/workcenters"
            />
          )}
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-evenly">
          {account && <AccountMenu />}
          {user && <UserMenu self={user} />}
          {user?.isGlobalAdmin && account && accounts && (
            <AdminMenu account={account} accounts={accounts} />
          )}
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
