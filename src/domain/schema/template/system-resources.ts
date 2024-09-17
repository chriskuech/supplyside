import { deepStrictEqual } from 'assert'
import { entries, filter, flatMap, groupBy, map, mapValues, pipe } from 'remeda'
import { ResourceTemplate } from './types'
import { fields } from './system-fields'
import config from '@/services/config'

const _resources = {
  mcMasterCarrVendor: {
    templateId: '5a71b50c-0a97-4c6a-aec0-2467c1655ce7',
    type: 'Vendor',
    fields: [
      { field: fields.name, value: { string: 'McMaster-Carr' } },
      {
        field: fields.poRecipient,
        value: {
          contact: {
            email:
              config().NODE_ENV === 'production' ? 'sales@mcmaster.com' : null,
            name: null,
            phone: '(562) 692-5911',
            title: null,
          },
        },
      },
    ],
  },
} satisfies Record<string, ResourceTemplate>

export const resources: Record<keyof typeof _resources, ResourceTemplate> =
  _resources

// Ensure that the templateIds are unique
deepStrictEqual(
  pipe(
    [resources],
    flatMap((e) => Object.values(e)),
    map((e) => e.templateId),
    groupBy((e) => e),
    mapValues((group) => group.length),
    entries(),
    filter(([, count]) => count > 1),
    map(([templateId]) => templateId),
  ),
  [],
)

// TODO: Ensure that fields respect system schemas and values respect fieldType
