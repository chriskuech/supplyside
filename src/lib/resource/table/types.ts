import { GridColDef } from '@mui/x-data-grid'
import { Value } from '@/domain/resource/values/types'
import { Resource } from '@/domain/resource/types'

export type Display = number | string | null | undefined

// export type Row = { id: string; key: number; index: number; fields: RowField[] }
export type Row = Resource & { index: number }

export type Cell = Value | undefined

export type Column = GridColDef<Row, Cell, Display>
