import { Table, TableCell, TableRow, Typography } from '@mui/material'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import { Resource } from '@supplyside/model'
import { FC, Fragment } from 'react'
import { readResources } from '@/client/resource'

type Props = {
  accountId: string
  partId: string
}

export default async function OperationsTable({ accountId, partId }: Props) {
  const steps = await readResources(accountId, 'Step', {
    where: {
      '==': [{ var: fields.part.name }, partId],
    },
  })

  return (
    <Table size="small" sx={{ '& td, & th': { border: '1px solid black' } }}>
      {steps?.map((step) =>
        selectResourceFieldValue(step, fields.purchase)?.resource ? (
          <PurchaseStep key={step.id} step={step} />
        ) : (
          <WorkCenterStep key={step.id} step={step} />
        ),
      )}
    </Table>
  )
}

const PurchaseStep: FC<{ step: Resource }> = async ({ step }) => {
  const operations = await readResources(step.accountId, 'Operation', {
    where: {
      '==': [{ var: fields.step.name }, step.id],
    },
  })

  return (
    <>
      <TableRow
        sx={{
          background: 'lightgray',
          '@media print': {
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
          },
        }}
      >
        <TableCell colSpan={6} sx={{ fontWeight: 'bold' }}>
          Purchase #
          {selectResourceFieldValue(step, fields.purchase)?.resource?.key} from{' '}
          {selectResourceFieldValue(step, fields.vendor)?.resource?.name} -{' '}
          {selectResourceFieldValue(step, fields.purchaseStatus)?.option?.name}
        </TableCell>
      </TableRow>
      {selectResourceFieldValue(step, fields.purchaseDescription)?.string && (
        <TableRow>
          <TableCell colSpan={6}>
            {selectResourceFieldValue(step, fields.purchaseDescription)?.string}
          </TableCell>
        </TableRow>
      )}
      <TableRow>
        <TableCell sx={{ fontWeight: 'bold' }}> </TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
        <TableCell sx={{ fontWeight: 'bold' }} colSpan={3}>
          Line Notes
        </TableCell>
      </TableRow>
      {operations?.length ? (
        operations.map((operation) => (
          <TableRow key={operation.id}>
            <TableCell> </TableCell>
            <TableCell>
              {selectResourceFieldValue(operation, fields.quantity)?.number}
            </TableCell>
            <TableCell>
              {selectResourceFieldValue(operation, fields.itemName)?.string}
            </TableCell>
            <TableCell colSpan={3}>
              {selectResourceFieldValue(operation, fields.otherNotes)?.string}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
            No items
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

const WorkCenterStep: FC<{ step: Resource }> = async ({ step }) => {
  const operations = await readResources(step.accountId, 'Operation', {
    where: {
      '==': [{ var: fields.step.name }, step.id],
    },
  })

  return (
    <>
      <TableRow
        sx={{
          background: 'lightgray',
          '@media print': {
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
          },
        }}
      >
        <TableCell colSpan={6} sx={{ fontWeight: 'bold' }}>
          {selectResourceFieldValue(step, fields.workCenter)?.resource?.name}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6}>
          <Typography variant="overline" lineHeight="1em">
            Notes
          </Typography>
          {selectResourceFieldValue(step, fields.otherNotes)?.string}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ fontWeight: 'bold' }}> </TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>Operation</TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>Operator</TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>Date Complete</TableCell>
      </TableRow>
      {operations?.length ? (
        operations.map((operation) => (
          <TableRow key={operation.id}>
            <TableCell> </TableCell>
            <TableCell>
              {
                selectResourceFieldValue(operation, fields.sequenceNumber)
                  ?.number
              }
            </TableCell>
            <TableCell>
              {selectResourceFieldValue(operation, fields.name)?.string}
            </TableCell>
            <TableCell>
              {selectResourceFieldValue(operation, fields.otherNotes)?.string}
            </TableCell>
            <TableCell>
              {
                selectResourceFieldValue(operation, fields.operator)?.resource
                  ?.name
              }
            </TableCell>
            <TableCell>
              {selectResourceFieldValue(operation, fields.dateCompleted)?.date}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
            No operations
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
