import { Address } from '../types'

export const formatInlineAddress = (address: Address): string => {
  const { streetAddress, city, state, zip, country } = address

  const stateZip = [state, zip].filter(Boolean).join(' ')

  return [streetAddress, city, stateZip, country].filter(Boolean).join(', ')
}
