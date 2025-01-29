import { GridColDef } from '@mui/x-data-grid'
import { Resource, Value } from '@supplyside/model'

export type Display = number | string | null | undefined

export type Row = Resource & { index: number }

export type Cell = Value | undefined

export type Column = GridColDef<Row, Cell, Display>
