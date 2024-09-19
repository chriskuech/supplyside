import { resources } from '../schema/template/system-resources'
import {
  updateTemplateId,
  createResource,
  findByTemplateId,
  updateResource,
} from '../resource'
import { selectSchemaFieldUnsafe } from '../schema/extensions'
import { readSchema } from '../schema'
import prisma from '@/services/prisma'
import { findResources } from '@/lib/resource/actions'

export async function createConnection(
  accountId: string,
  username: string,
  password: string,
) {
  //TODO: check if username and password is correct throw expected error otherwise

  const [mcMasterCarrVendor] = await findResources({
    resourceType: 'Vendor',
    input: 'McMaster-Carr',
  })

  const vendorSchema = await readSchema({ accountId, resourceType: 'Vendor' })
  const mcMasterCarrSystemResource = resources().mcMasterCarrVendor

  if (!mcMasterCarrVendor) {
    await createResource({
      accountId,
      type: 'Vendor',
      templateId: mcMasterCarrSystemResource.templateId,
      fields: mcMasterCarrSystemResource.fields.map((f) => ({
        fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).id,
        value: f.value,
      })),
    })
  } else {
    await updateResource({
      accountId,
      resourceId: mcMasterCarrVendor.id,
      fields: mcMasterCarrSystemResource.fields.map((f) => ({
        fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).id,
        value: f.value,
      })),
    })

    if (!mcMasterCarrVendor.templateId) {
      await updateTemplateId({
        accountId,
        resourceId: mcMasterCarrVendor.id,
        templateId: mcMasterCarrSystemResource.templateId,
      })
    }
  }

  await prisma().account.update({
    where: { id: accountId },
    data: {
      mcMasterCarrConnectedAt: new Date(),
      mcMasterCarrUsername: username,
      mcMasterCarrPassword: password,
    },
  })
}

export async function disconnect(accountId: string) {
  const mcMasterCarrVendor = await findByTemplateId({
    accountId,
    templateId: resources().mcMasterCarrVendor.templateId,
  })

  if (mcMasterCarrVendor) {
    await updateTemplateId({
      accountId,
      resourceId: mcMasterCarrVendor.id,
      templateId: null,
    })
  }

  await prisma().account.update({
    where: { id: accountId },
    data: {
      mcMasterCarrUsername: null,
      mcMasterCarrPassword: null,
      mcMasterCarrConnectedAt: null,
    },
  })
}
