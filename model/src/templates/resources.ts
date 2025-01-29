import { deepStrictEqual } from 'assert'
import { entries, filter, groupBy, map, mapValues, pipe } from 'remeda'
import { fields } from './fields'
import { ResourceTemplate } from './types'

export const MCMASTER_CARR_NAME = 'McMaster-Carr'

export const resources = {
  mcMasterCarrVendor: {
    templateId: '5a71b50c-0a97-4c6a-aec0-2467c1655ce7',
    type: 'Vendor',
    fields: [
      {
        field: fields.name,
        value: { string: MCMASTER_CARR_NAME },
      },
      {
        field: fields.poRecipient,
        value: {
          contact: {
            email: 'sales@mcmaster.com',
            name: null,
            phone: '(562) 692-5911',
            title: null,
          },
        },
      },
    ],
  },
} as const satisfies Record<string, ResourceTemplate>

// Ensure that the templateIds are unique
deepStrictEqual(
  pipe(
    Object.values(resources),
    map((e) => e.templateId),
    groupBy((e) => e),
    mapValues((group) => group.length),
    entries(),
    filter(([, count]) => count > 1),
    map(([templateId]) => templateId),
  ),
  [],
)
