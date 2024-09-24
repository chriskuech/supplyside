import { fail } from 'assert'
import config from '../config'

export const getMcMasterCarrConfig = () => {
  const {
    PUNCHOUT_MCMASTER_POSR_URL: posrUrl,
    PUNCHOUT_MCMASTER_SHARED_SECRET: secret,
    PUNCHOUT_MCMASTER_SUPPLIER_DOMAIN: supplierDomain,
    PUNCHOUT_MCMASTER_SUPPLIER_IDENTITY: supplierIdentity,
  } = config()

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
