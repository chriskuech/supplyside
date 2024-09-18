import { GridColDef } from '@mui/x-data-grid'
import { Value } from '@/domain/resource/entity'
import { Resource } from '@/domain/resource/entity'

export type Display = number | string | null | undefined

export type Row = Resource & { index: number }

export type Cell = Value | undefined

export type Column = GridColDef<Row, Cell, Display>
