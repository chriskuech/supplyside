'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Modal,
  Stack,
  Typography,
} from '@mui/material'
import { AddLink, Link } from '@mui/icons-material'
import { isTruthy } from 'remeda'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ResourceTable } from '@/lib/resource/table'
import { useResources } from '@/lib/resource/useResources'
import useSchema from '@/lib/schema/useSchema'
import { useConfirmation } from '@/lib/confirmation'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import { linkPurchase } from '@/actions/bill'
import { updateResource } from '@/actions/resource'

type Props = {
  resource: Resource
}

export default function MatchControl({ resource }: Props) {
  const { open, isOpen, close } = useDisclosure()
  const [{ isLoading }, callback] = useAsyncCallback((purchaseId: string) =>
    linkPurchase(resource.id, { purchaseId }).then(close),
  )
  const confirm = useConfirmation()
  const purchaseSchema = useSchema('Purchase')
  const unlinkedPurchases = useResources('Purchase', undefined)

  const purchase = selectResourceFieldValue(resource, fields.purchase)?.resource

  const poNumber = selectResourceFieldValue(resource, fields.poNumber)?.string
  const vendorName = selectResourceFieldValue(resource, fields.vendor)?.resource
    ?.name

  return (
    <>
      <Button
        color={purchase ? 'success' : 'secondary'}
        size="large"
        sx={{ height: 'fit-content', fontSize: '1.2em' }}
        endIcon={purchase ? <Link /> : <AddLink />}
        onClick={
          purchase
            ? async () => {
                const isConfirmed = await confirm({
                  title: 'Unlink Purchase',
                  content: 'Are you sure you want to unlink this Purchase?',
                })

                if (!isConfirmed) return

                await updateResource(resource.id, [
                  {
                    field: fields.purchase,
                    valueInput: { resourceId: null },
                  },
                ])
              }
            : open
        }
      >
        {purchase ? 'Purchase Matched' : 'Match Purchase'}
      </Button>

      <Modal
        open={isOpen}
        onClose={close}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: 1000, maxHeight: '90%' }}>
          <CardContent>
            <Stack spacing={4}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                3-Way Match
              </Typography>
              <Typography
                id="modal-modal-description"
                sx={{ mt: 2, whiteSpace: 'wrap' }}
              >
                Match your Purchase to the Bill to complete the 3-way match.
              </Typography>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Box>Receipt</Box>
                <Link />
                <Box>Purchase</Box>
                {isLoading ? <CircularProgress /> : <AddLink />}
                <Box>Bill</Box>
              </Stack>
              <Box>
                {!unlinkedPurchases || !purchaseSchema ? (
                  <CircularProgress />
                ) : (
                  <ResourceTable
                    tableKey={MatchControl.name}
                    schemaData={purchaseSchema}
                    resources={unlinkedPurchases}
                    initialQuery={[poNumber, vendorName]
                      .filter(isTruthy)
                      .join(' ')}
                    onRowClick={({
                      row, // `row` is coming in as `any` for some reason
                    }) => !isLoading && callback(row.id)}
                  />
                )}
              </Box>
              <Stack direction="row" sx={{ justifyContent: 'end' }}>
                <Button onClick={close} disabled={!isLoading}>
                  Close
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Modal>
    </>
  )
}
