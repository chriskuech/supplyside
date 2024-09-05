import { Prisma } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { ValueInput } from './input'

export const mapValueInputToPrismaCreate = (
  value: ValueInput,
): Prisma.ValueCreateWithoutResourceFieldValueInput => ({
  boolean: value.boolean ?? undefined,
  Contact: value.contact
    ? {
        create: {
          name: value.contact.name,
          title: value.contact.title,
          email: value.contact.email,
          phone: value.contact.phone,
        },
      }
    : undefined,
  date: value.date,
  number: value.number ?? null,
  Option: match(value.option)
    .with(P.nullish, () => undefined)
    .with({ id: P.string }, ({ id }) => ({ connect: { id } }))
    .exhaustive(),
  // ValueOption: value.optionIds?.length
  //   ? ({
  //       create: value.optionIds.map((id) => ({
  //         Option: { connect: { id } },
  //       })),
  //     } satisfies Prisma.ValueOptionCreateNestedManyWithoutValueInput)
  //   : undefined,
  File: value.fileId ? { connect: { id: value.fileId } } : undefined,
  Resource: value.resource?.id
    ? { connect: { id: value.resource.id } }
    : undefined,
  string: value.string ?? null,
  User: value.user?.id ? { connect: { id: value.user.id } } : undefined,
})

export const mapValueInputToPrismaUpdate = (
  value: ValueInput,
): Prisma.ValueUpdateWithoutResourceFieldValueInput => ({
  boolean: value.boolean ?? undefined,
  Contact: value.contact
    ? {
        create: {
          name: value.contact.name,
          title: value.contact.title,
          email: value.contact.email,
          phone: value.contact.phone,
        },
      }
    : undefined,
  date: value.date,
  number: value.number ?? null,
  Option: match(value.option)
    .with(null, () => ({ disconnect: true }))
    .with(undefined, () => undefined)
    .with({ id: P.string }, ({ id }) => ({ connect: { id } }))
    .exhaustive(),

  // ValueOption: value.optionIds?.length
  //   ? ({
  //       create: value.optionIds.map((id) => ({
  //         Option: { connect: { id } },
  //       }),
  //     } satisfies Prisma.ValueOptionUpsertNestedManyWithoutValueInput)
  //   : undefined,
  File: value.fileId ? { connect: { id: value.fileId } } : undefined,
  Resource: value.resource?.id
    ? { connect: { id: value.resource.id } }
    : undefined,
  string: value.string ?? null,
  User: value.user ? { connect: { id: value.user.id } } : undefined,
})
