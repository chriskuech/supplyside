import { z } from 'zod'

export const posrResponseSchema = z.object({
  cXML: z.object({
    Response: z.array(
      z.object({
        Status: z.array(
          z.object({
            $: z.object({
              code: z.string(),
            }),
          }),
        ),
        PunchOutSetupResponse: z.array(
          z.object({
            StartPage: z.array(
              z.object({
                URL: z.array(z.string()),
              }),
            ),
          }),
        ),
      }),
    ),
  }),
})

export type RenderPOSRTemplateParams = {
  payloadId: string
  punchOutCustomerDomain: string
  punchOutCustomerName: string
  punchOutClientDomain: string
  clientName: string
  punchOutSharedSecret: string
  buyerCookie: string
  poomReturnEndpoint: string
}
