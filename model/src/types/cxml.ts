import { z } from 'zod'

export const cxmlSchema = z.object({
  cXML: z.object({
    $: z.object({
      timestamp: z.string(),
      payloadID: z.string(),
    }),
    Header: z
      .object({
        From: z
          .object({
            Credential: z
              .object({
                $: z.object({
                  domain: z.string(),
                }),
                Identity: z.string().array(),
              })
              .array(),
          })
          .array(),
        To: z
          .object({
            Credential: z
              .object({
                $: z.object({
                  domain: z.string(),
                }),
                Identity: z.string().array(),
              })
              .array(),
          })
          .array(),
        Sender: z
          .object({
            Credential: z
              .object({
                $: z.object({
                  domain: z.string(),
                }),
                Identity: z.string().array(),
                SharedSecret: z.string().array(),
              })
              .array(),
            UserAgent: z.string().array(),
          })
          .array(),
      })
      .array(),
    Message: z
      .object({
        PunchOutOrderMessage: z
          .object({
            BuyerCookie: z.string().array(),
            PunchOutOrderMessageHeader: z
              .object({
                $: z.object({
                  operationAllowed: z.string(),
                }),
                Total: z
                  .object({
                    Money: z
                      .object({
                        $: z.object({
                          currency: z.string(),
                        }),
                        _: z.coerce.number(),
                      })
                      .array(),
                  })
                  .array(),
              })
              .array(),
            ItemIn: z.array(
              z.object({
                $: z.object({
                  quantity: z.coerce.number(),
                }),
                ItemID: z
                  .object({
                    SupplierPartID: z.string().array(),
                    SupplierPartAuxiliaryID: z.string().array(),
                  })
                  .array(),
                ItemDetail: z
                  .object({
                    UnitPrice: z
                      .object({
                        Money: z
                          .object({
                            $: z.object({
                              currency: z.string(),
                            }),
                            _: z.coerce.number(),
                          })
                          .array(),
                      })
                      .array(),
                    Description: z
                      .object({
                        _: z.string(),
                        $: z.object({
                          'xml:lang': z.string(),
                        }),
                      })
                      .array(),
                    UnitOfMeasure: z.string().array(),
                    Classification: z
                      .object({
                        $: z.object({
                          domain: z.string(),
                          _: z.string().optional(),
                        }),
                      })
                      .array(),
                    ManufacturerPartID: z.string().array(),
                    ManufacturerName: z.string().array(),
                  })
                  .array(),
              }),
            ),
          })
          .array(),
      })
      .array(),
  }),
})

export type Cxml = z.infer<typeof cxmlSchema>
