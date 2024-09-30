import { PrismaService } from "@supplyside/api/integrations/PrismaService";
import { injectable } from "inversify";
import {
  FieldType,
  ResourceType,
  SchemaField,
  ValueInput,
} from "@supplyside/model";
import { mapFieldModelToEntity } from "../schema/mappers";
import { fieldIncludes } from "../schema/model";
import { OptionPatch } from "../schema/SchemaFieldService";

@injectable()
export class FieldService {
  constructor(private readonly prisma: PrismaService) {}

  async readFields(accountId: string): Promise<SchemaField[]> {
    const fields = await this.prisma.field.findMany({
      where: {
        accountId,
      },
      orderBy: {
        name: "asc",
      },
      include: fieldIncludes,
    });

    return fields.map(mapFieldModelToEntity);
  }

  async createField(
    accountId: string,
    data: {
      name: string;
      type: FieldType;
      resourceType?: ResourceType;
      isRequired: boolean;
    }
  ) {
    await this.prisma.field.create({
      data: {
        ...data,
        Account: {
          connect: {
            id: accountId,
          },
        },
        DefaultValue: {
          create: {},
        },
      },
    });
  }

  async updateField(
    accountId: string,
    fieldId: string,
    dto: {
      name?: string;
      description?: string | null;
      resourceType?: ResourceType | null;
      isRequired?: boolean;
      options?: OptionPatch[];
      defaultValue?: ValueInput;
    }
  ) {
    await this.prisma.field.update({
      where: { id: fieldId, accountId },
      data: {
        name: dto.name,
        description: dto.description,
        resourceType: dto.resourceType,
        isRequired: dto.isRequired,
        DefaultValue: {
          update: dto.defaultValue,
        },
      },
    });
  }

  async deleteField(accountId: string, fieldId: string) {
    await this.prisma.field.delete({
      where: {
        id: fieldId,
        accountId,
      },
    });
  }
}
