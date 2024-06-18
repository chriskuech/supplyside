type JsonLogicVariable = { var: string }
export type JsonLogicValue = string | number | boolean | null

type JsonLogic =
  | { '==': [JsonLogicVariable, JsonLogicValue] }
  | { '!=': [JsonLogicVariable, JsonLogicValue] }

export type Where = JsonLogic

export type OrderBy = JsonLogicVariable & { dir: 'asc' | 'desc' }
