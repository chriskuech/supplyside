type JsonLogicVariable = { var: string }
type JsonLogicValue = string | number | boolean | null

export type JsonLogic =
  | { '==': [JsonLogicVariable, JsonLogicValue] }
  | { '!=': [JsonLogicVariable, JsonLogicValue] }
