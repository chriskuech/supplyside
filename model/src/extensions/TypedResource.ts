import { FieldTemplate } from "../templates";
import { Contact, ValueResource } from "../types";
import { Resource } from "../types/resource";
import { Schema } from "../types/schema";
import { selectResourceFieldValue } from "./resource";
import { selectSchemaFieldUnsafe } from "./schema";
import { Option } from "../types/option";

export class TypedResource {
  updatedFields: ResourceFieldInput[] = [];

  constructor(private schema: Schema, private resource: Resource | null) {}

  getResource(template: FieldTemplate): ValueResource | null | undefined {
    const sf = selectSchemaFieldUnsafe(this.schema, template);

    return selectResourceFieldValue(this.resource, sf)?.resource;
  }

  setDate(
    template: FieldTemplate & { type: "Date" },
    value: Date | string | null | undefined
  ): TypedResource {
    const sf = selectSchemaFieldUnsafe(this.schema, template);

    return this;
  }

  setString(
    template: FieldTemplate & { type: "Text" | "Textarea" },
    value: string | null | undefined
  ): TypedResource {
    return this;
  }

  setContact(
    template: FieldTemplate & { type: "Contact" },
    value: Contact | null | undefined
  ): TypedResource {
    return this;
  }

  setNumber(
    template: FieldTemplate & { type: "Number" | "Money" },
    value: number | null | undefined
  ): TypedResource {
    return this;
  }

  setBoolean(
    template: FieldTemplate & { type: "Checkbox" },
    value: boolean | null | undefined
  ): TypedResource {
    return this;
  }

  setMultiSelect(
    template: FieldTemplate & { type: "MultiSelect" },
    value: Option[] | undefined
  ): TypedResource {
    return this;
  }

  setSelect(
    template: FieldTemplate & { type: "Select" },
    value: Option | null | undefined
  ): TypedResource {
    return this;
  }

  setResource(
    template: FieldTemplate & { type: "Resource" },
    value: ValueResource | null | undefined
  ): TypedResource {
    return this;
  }
}
