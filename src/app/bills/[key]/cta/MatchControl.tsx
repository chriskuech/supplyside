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
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import { selectResourceField } from '@/domain/resource/extensions'
import { ResourceTable } from '@/lib/resource/table'
import { Schema, selectSchemaField } from '@/domain/schema/types'
import { fields } from '@/domain/schema/template/system-fields'
import { Resource } from '@/domain/resource/entity'
import { updateResourceField } from '@/lib/resource/actions'
import { useResources } from '@/lib/resource/useResources'

type Props = {
  schema: Schema
  resource: Resource
}

export default function MatchControl({ schema, resource }: Props) {
  const { open, isOpen, close } = useDisclosure()

  const order = selectResourceField(resource, fields.order)?.resource

  const unlinkedOrders = useResources('Order', {
    '==': [{ var: fields.bill.name }, null],
  })

  return (
    <>
      <Button
        color={order ? 'success' : 'secondary'}
        size="large"
        sx={{ height: 'fit-content', fontSize: '1.2em' }}
        endIcon={order ? <Link /> : <AddLink />}
        onClick={open}
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
        <Card sx={{ width: 350 }}>
          <CardContent>
            <Stack spacing={2}>
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
                <AddLink />
                <Box>Bill</Box>
              </Stack>
              <Box>
                {!unlinkedOrders ? (
                  <CircularProgress />
                ) : (
                  <ResourceTable
                    schema={schema}
                    resources={unlinkedOrders}
                    initialState={{
                      filter: {
                        filterModel: {
                          items: [],
                          quickFilterValues: [
                            // TODO: put the initial filter here once we have the correct fields
                          ],
                        },
                      },
                    }}
                    onRowClick={({
                      row, // `row` is coming in as `any` for some reason
                    }) =>
                      updateResourceField({
                        resourceId: resource.id,
                        fieldId:
                          selectSchemaField(schema, fields.order)?.id ?? fail(),
                        value: { resourceId: row.id },
                      }).then(() => close())
                    }
                  />
                )}
              </Box>
              <Stack direction="row" sx={{ justifyContent: 'end' }}>
                <Button onClick={close}>Close</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Modal>
    </>
  )
}
