import { Field, Option, Prisma } from "@prisma/client";
import { ValueModel, valueInclude } from "../resource/model";

export const fieldIncludes = {
  DefaultValue: {
    include: valueInclude,
  },
  Option: {
    orderBy: {
      order: "asc",
    },
  },
} satisfies Prisma.FieldInclude;

export type FieldModel = Field & {
  Option: Option[];
  DefaultValue: ValueModel | null;
};

export const schemaIncludes = {
  SchemaField: {
    include: {
      Field: {
        include: fieldIncludes,
      },
    },
    orderBy: {
      order: "asc",
    },
  },
  Section: {
    include: {
      SectionField: {
        include: {
          Field: {
            include: fieldIncludes,
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  },
} satisfies Prisma.SchemaInclude;
