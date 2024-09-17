import { Resource } from '../resource/entity'
import { selectResourceFieldValue } from '../resource/extensions'
import { fields } from '../schema/template/system-fields'

export const mapVendorsToVendorList = (vendors: Resource[]) =>
  'Vendor List\n\n' +
  [
    {
      id: 'ID',
      name: 'Name',
    },
    ...vendors.map((vendor) => ({
      id: vendor.id,
      name: selectResourceFieldValue(vendor, fields.name)?.string,
    })),
  ]
    .filter(({ name }) => !!name)
    .map(({ id, name }) => `${id}\t${name}`)
    .join('\n')
