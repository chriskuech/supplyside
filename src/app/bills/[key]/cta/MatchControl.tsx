'use client'

import { fail } from 'assert'
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
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { ResourceTable } from '@/lib/resource/table'
import { Schema } from '@/domain/schema/entity'
import { fields } from '@/domain/schema/template/system-fields'
import { Resource } from '@/domain/resource/entity'
import { updateResourceField } from '@/lib/resource/actions'
import { useResources } from '@/lib/resource/useResources'
import { selectSchemaField } from '@/domain/schema/extensions'
import useSchema from '@/lib/schema/useSchema'
import { useConfirmation } from '@/lib/confirmation'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'

type Props = {
  schema: Schema
  resource: Resource
}

export default function MatchControl({ schema, resource }: Props) {
  const { open, isOpen, close } = useDisclosure()
  const [{ isLoading }, callback] = useAsyncCallback(
    async (resourceId: string) =>
      updateResourceField({
        resourceId: resource.id,
        fieldId: selectSchemaField(schema, fields.order)?.id ?? fail(),
        value: { resourceId },
      }).then(() => close()),
  )
  const confirm = useConfirmation()

  const order = selectResourceFieldValue(resource, fields.order)?.resource

  const poNumber = selectResourceFieldValue(resource, fields.poNumber)?.string
  const vendorName = selectResourceFieldValue(resource, fields.vendor)?.resource
    ?.name

  const orderSchema = useSchema('Order')

  const unlinkedOrders = useResources('Order', undefined)

  return (
    <>
      <Button
        color={order ? 'success' : 'secondary'}
        size="large"
        sx={{ height: 'fit-content', fontSize: '1.2em' }}
        endIcon={order ? <Link /> : <AddLink />}
        onClick={
          order
            ? async () => {
                const isConfirmed = await confirm({
                  title: 'Unlink Order',
                  content: 'Are you sure you want to unlink this Order?',
                })

                if (!isConfirmed) return

                await updateResourceField({
                  resourceId: resource.id,
                  fieldId:
                    selectSchemaField(schema, fields.order)?.id ?? fail(),
                  value: { resourceId: null },
                })
              }
            : open
        }
      >
        {order ? 'Order Matched' : 'Match Order'}
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
                Match your Order to the Bill to complete the 3-way match.
              </Typography>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Box>Receipt</Box>
                <Link />
                <Box>Order</Box>
                {isLoading ? <CircularProgress /> : <AddLink />}
                <Box>Bill</Box>
              </Stack>
              <Box>
                {!unlinkedOrders || !orderSchema ? (
                  <CircularProgress />
                ) : (
                  <ResourceTable
                    tableKey={MatchControl.name}
                    schema={orderSchema}
                    resources={unlinkedOrders}
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
