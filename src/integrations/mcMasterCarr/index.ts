import { container } from 'tsyringe'
import { PrismaService } from '../PrismaService'
import { selectSchemaFieldUnsafe } from '@/domain/schema/extensions'
import { readSchema } from '@/domain/schema'
import {
  updateTemplateId,
  createResource,
  findByTemplateId,
  updateResource,
} from '@/domain/resource'
import { resources } from '@/domain/schema/template/system-resources'
import { findResources } from '@/lib/resource/actions'

export async function createConnection(
  accountId: string,
  username: string,
  password: string,
) {
  const prisma = container.resolve(PrismaService)

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

  await prisma.account.update({
    where: { id: accountId },
    data: {
      mcMasterCarrConnectedAt: new Date(),
      mcMasterCarrUsername: username,
      mcMasterCarrPassword: password,
    },
  })
}

export async function disconnect(accountId: string) {
  const prisma = container.resolve(PrismaService)

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

  await prisma.account.update({
    where: { id: accountId },
    data: {
      mcMasterCarrUsername: null,
      mcMasterCarrPassword: null,
      mcMasterCarrConnectedAt: null,
    },
  })
}
