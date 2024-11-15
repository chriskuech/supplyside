export type FieldReference =
  | { templateId: string }
  | { fieldId: string }
  | { name: string }

export type OptionReference =
  | { templateId: string }
  | { id: string } // TODO: change to optionId
  | { name: string }
