import assert from 'assert'
import {
  Box,
  Card,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material'
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
import { GridFilterModel } from '@mui/x-data-grid'
import {
  billStatusOptions,
  fields,
  jobStatusOptions,
  purchaseStatusOptions,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import Logo from '@/lib/ux/appbar/Logo'
import { AccountMenu } from '@/lib/ux/appbar/AccountMenu'
import { UserMenu } from '@/lib/ux/appbar/UserMenu'
import { requireSession } from '@/session'
import { readAccount } from '@/client/account'
import { readSelf } from '@/client/user'
import { readSchema } from '@/actions/schema'
import { config } from '@/config'

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

  const createFilterUrl = (basePath: string, filters: GridFilterModel) => {
    const url = new URL(basePath, config().BASE_URL)
    url.searchParams.append(
      'filter',
      encodeURIComponent(JSON.stringify(filters)),
    )

    return url.toString()
  }

  const [purchaseLineSchema, jobSchema, purchaseSchema, billSchema] =
    await Promise.all([
      readSchema('PurchaseLine'),
      readSchema('Job'),
      readSchema('Purchase'),
      readSchema('Bill'),
    ])

  assert(purchaseLineSchema, 'PurchaseLine schema not found')
  assert(jobSchema, 'Job schema not found')
  assert(purchaseSchema, 'Purchase schema not found')
  assert(billSchema, 'Bill schema not found')

  const jobStatusField = selectSchemaFieldUnsafe(jobSchema, fields.jobStatus)
  const jobStatusPaidOptionId = selectSchemaFieldOptionUnsafe(
    jobSchema,
    fields.jobStatus,
    jobStatusOptions.paid,
  ).id
  const jobStatusCanceledOptionId = selectSchemaFieldOptionUnsafe(
    jobSchema,
    fields.jobStatus,
    jobStatusOptions.canceled,
  ).id

  const closedJobsFilter: GridFilterModel = {
    items: [
      {
        field: jobStatusField.fieldId,
        operator: 'isAnyOf',
        value: [jobStatusPaidOptionId, jobStatusCanceledOptionId],
      },
    ],
  }

  const openJobsFilter: GridFilterModel = {
    items: [
      {
        field: jobStatusField.fieldId,
        operator: 'isAnyOf',
        value: jobStatusField.options
          .filter(
            (option) =>
              ![jobStatusPaidOptionId, jobStatusCanceledOptionId].includes(
                option.id,
              ),
          )
          .map((option) => option.id),
      },
    ],
  }

  const purchaseStatusField = selectSchemaFieldUnsafe(
    purchaseSchema,
    fields.purchaseStatus,
  )
  const purchaseStatusReceivedOptionId = selectSchemaFieldOptionUnsafe(
    purchaseSchema,
    fields.purchaseStatus,
    purchaseStatusOptions.received,
  ).id
  const purchaseStatusCanceledOptionId = selectSchemaFieldOptionUnsafe(
    purchaseSchema,
    fields.purchaseStatus,
    purchaseStatusOptions.canceled,
  ).id

  const closedPurchasesFilter: GridFilterModel = {
    items: [
      {
        field: purchaseStatusField.fieldId,
        operator: 'isAnyOf',
        value: [purchaseStatusReceivedOptionId, purchaseStatusCanceledOptionId],
      },
    ],
  }

  const openPurchasesFilter: GridFilterModel = {
    items: [
      {
        field: purchaseStatusField.fieldId,
        operator: 'isAnyOf',
        value: purchaseStatusField.options
          .filter(
            (option) =>
              ![
                purchaseStatusReceivedOptionId,
                purchaseStatusCanceledOptionId,
              ].includes(option.id),
          )
          .map((option) => option.id),
      },
    ],
  }

  const billStatusField = selectSchemaFieldUnsafe(billSchema, fields.billStatus)
  const billStatusPaidOptionId = selectSchemaFieldOptionUnsafe(
    billSchema,
    fields.billStatus,
    billStatusOptions.paid,
  ).id
  const billStatusCanceledOptionId = selectSchemaFieldOptionUnsafe(
    billSchema,
    fields.billStatus,
    billStatusOptions.canceled,
  ).id

  const closedBillsFilter: GridFilterModel = {
    items: [
      {
        field: billStatusField.fieldId,
        operator: 'isAnyOf',
        value: [billStatusPaidOptionId, billStatusCanceledOptionId],
      },
    ],
  }

  const unpaidBillsFilter: GridFilterModel = {
    items: [
      {
        field: billStatusField.fieldId,
        operator: 'isAnyOf',
        value: billStatusField.options
          .filter(
            (option) =>
              ![billStatusPaidOptionId, billStatusCanceledOptionId].includes(
                option.id,
              ),
          )
          .map((option) => option.id),
      },
    ],
  }

  const purchaseField = selectSchemaFieldUnsafe(
    purchaseLineSchema,
    fields.purchase,
  )
  const billField = selectSchemaFieldUnsafe(purchaseLineSchema, fields.bill)

  const purchasesLines: GridFilterModel = {
    items: [
      {
        field: purchaseField.fieldId,
        operator: 'isNotEmpty',
      },
    ],
  }

  const billsLines: GridFilterModel = {
    items: [
      {
        field: billField.fieldId,
        operator: 'isNotEmpty',
      },
    ],
  }

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
              href={createFilterUrl('/jobs', openJobsFilter)}
            />
            <ItemLink
              title="Closed Jobs"
              href={createFilterUrl('/jobs', closedJobsFilter)}
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
              href={createFilterUrl('/purchases', openPurchasesFilter)}
            />
            <ItemLink
              title="Closed Purchases"
              href={createFilterUrl('/purchases', closedPurchasesFilter)}
            />
            <ItemLink
              title="Lines"
              href={createFilterUrl('/purchaselines', purchasesLines)}
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
              href={createFilterUrl('/bills', unpaidBillsFilter)}
            />
            <ItemLink
              title="Closed Bills"
              href={createFilterUrl('/bills', closedBillsFilter)}
            />
            <ItemLink
              title="Lines"
              href={createFilterUrl('/purchaselines', billsLines)}
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
      // TODO: change to Next's link component
      // I used MUI Link instead of Next's Link to trigger filters recalculation when navigating to same path
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
