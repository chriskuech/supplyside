import { fail } from 'assert'
import { container } from 'tsyringe'
import ConfigService from '../ConfigService'

export const getMcMasterCarrConfig = () => {
  const {
    config: {
      PUNCHOUT_MCMASTER_POSR_URL: posrUrl,
      PUNCHOUT_MCMASTER_SHARED_SECRET: secret,
      PUNCHOUT_MCMASTER_SUPPLIER_DOMAIN: supplierDomain,
      PUNCHOUT_MCMASTER_SUPPLIER_IDENTITY: supplierIdentity,
    },
  } = container.resolve(ConfigService)

  if (!posrUrl || !secret || !supplierDomain || !supplierIdentity) {
    return null
  }

  return {
    posrUrl,
    secret,
    supplierDomain,
    supplierIdentity,
  }
}

export const getMcMasterCarrConfigUnsafe = () =>
  getMcMasterCarrConfig() ?? fail('McMaster-Carr not configured')
