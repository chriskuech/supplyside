'use server'

import assert from 'assert'
import { Box, Divider, Stack, Typography } from '@mui/material'
import {
  Build,
  Business,
  DataUsage,
  EventRepeat,
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
  Schema,
  billStatusOptions,
  fields,
  jobStatusOptions,
  purchaseStatusOptions,
} from '@supplyside/model'
import { ItemLink } from './NavItem'
import { AccountMenu } from '@/lib/ux/appbar/AccountMenu'
import { UserMenu } from '@/lib/ux/appbar/UserMenu'
import { requireSession } from '@/session'
import { readAccount, readAccounts } from '@/client/account'
import { readSelf } from '@/client/user'
import { NavLogo } from '@/lib/ux/appbar/NavLogo'
import { readResources } from '@/client/resource'
import { readSchema } from '@/client/schema'
import AdminMenu from '@/lib/ux/appbar/AdminMenu'

export default async function Sidebar() {
  const { userId, accountId } = await requireSession()
  const [
    user,
    account,
    accounts,
    jobSchemaData,
    purchaseSchemaData,
    billSchemaData,
  ] = await Promise.all([
    readSelf(userId),
    readAccount(accountId),
    readAccounts(),
    readSchema(accountId, 'Job'),
    readSchema(accountId, 'Purchase'),
    readSchema(accountId, 'Bill'),
  ])

  assert(jobSchemaData && purchaseSchemaData && billSchemaData)

  const jobSchema = new Schema(jobSchemaData)
  const purchaseSchema = new Schema(purchaseSchemaData)
  const billSchema = new Schema(billSchemaData)

  const jobStatusOptionId = (optionRef: OptionTemplate) =>
    jobSchema.getFieldOption(fields.jobStatus, optionRef).id
  const purchaseStatusOptionId = (optionRef: OptionTemplate) =>
    purchaseSchema.getFieldOption(fields.purchaseStatus, optionRef).id
  const billStatusOptionId = (optionRef: OptionTemplate) =>
    billSchema.getFieldOption(fields.billStatus, optionRef).id

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
        {
          '!=': [{ var: fields.recurring.name }, true],
        },
      ],
    },
  })

  const [inProcessJobs, openJobs, openPurchases, unpaidBills] =
    await Promise.all([
      gettingInProcessJobs,
      gettingOpenJobs,
      gettingOpenPurchases,
      gettingUnpaidBills,
    ])

  const openJobCount = openJobs?.length ?? 0
  const inProcessJobCount = inProcessJobs?.length ?? 0
  const openPurchaseCount = openPurchases?.length ?? 0
  const unpaidBillCount = unpaidBills?.length ?? 0

  return (
    <Stack
      width="min-content"
      m={2}
      spacing={2}
      sx={{
        minWidth: 250,
        width: 'auto',
      }}
      fontSize={{
        xs: '1.5rem',
        md: '1rem',
      }}
    >
      <Stack
        direction="column"
        alignItems={{
          xs: 'center',
          md: 'flex-start',
        }}
      >
        <NavLogo />
      </Stack>
      {user?.isGlobalAdmin && account && accounts && (
        <Box>
          <AdminMenu account={account} accounts={accounts} user={user} />
        </Box>
      )}
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
            href="/jobs/all"
            icon={<Build fontSize="small" />}
          />
          <ItemLink title="Open Jobs" href="/jobs/open" count={openJobCount} />
          <ItemLink
            title="In Process Jobs"
            href="/jobs/in-process"
            count={inProcessJobCount}
          />
          <ItemLink title="Closed Jobs" href="/jobs/closed" />
          <ItemLink
            title="Schedule"
            href="/jobs/schedule"
            icon={<ViewTimelineOutlined fontSize="small" />}
          />
          <ItemLink
            title="Capacity"
            href="/jobs/capacity"
            icon={<DataUsage fontSize="small" />}
          />
          <ItemLink
            title="Parts"
            href="/jobs/parts"
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
            href="/purchases/all"
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
            href="/bills/all"
            icon={<Receipt fontSize="small" />}
          />
          <ItemLink
            title="Unpaid Bills"
            href="/bills/unpaid"
            count={unpaidBillCount}
          />
          <ItemLink title="Closed Bills" href="/bills/closed" />
          <ItemLink
            title="Recurring Bills"
            href="/bills/recurring"
            icon={<EventRepeat fontSize="small" />}
          />
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
        <ItemLink
          icon={<PrecisionManufacturing fontSize="small" />}
          title="Work Centers"
          href="/workcenters"
        />
      </Box>

      <Divider />

      <Stack direction="row" justifyContent="space-evenly">
        {account && <AccountMenu />}
        {user && <UserMenu self={user} />}
      </Stack>
    </Stack>
  )
}
