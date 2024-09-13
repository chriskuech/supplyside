import { mapValue } from './utils'
import { Resource } from '@/domain/resource/entity'
import { fields } from '@/domain/schema/template/system-fields'

export const mapVendor = (vendorResource: Resource) => ({
  Id: mapValue(vendorResource, fields.quickBooksVendorId),
  DisplayName: mapValue(vendorResource, fields.name),
})
