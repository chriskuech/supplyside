import { Box } from '@mui/material'
import { FC, Fragment } from 'react'
import { range } from 'remeda'

type Props = {
  gridCellWidth: number
  gridCellHeight: number
  numRows: number
  numCols: number
}

export const GanttChartGrid: FC<Props> = ({
  gridCellWidth,
  gridCellHeight,
  numRows,
  numCols,
}) => (
  <>
    {/* Cols */}
    {range(0, numCols / 7).flatMap((i) => (
      <Fragment key={'col-' + i}>
        <Box
          position="absolute"
          height="100%"
          width={gridCellWidth}
          top={0}
          left={i * 7 * gridCellWidth}
          sx={{
            outline: '1px solid',
            outlineOffset: '-0.5px',
            outlineColor: 'divider',
          }}
          bgcolor="divider"
        />
        {range(1, 6).map((j) => (
          <Box
            key={`${i}-${j}`}
            position="absolute"
            height="100%"
            width={gridCellWidth}
            top={0}
            left={(i * 7 + j) * gridCellWidth}
            sx={{
              outline: '1px solid',
              outlineOffset: '-0.5px',
              outlineColor: 'divider',
            }}
          />
        ))}
        <Box
          position="absolute"
          height="100%"
          width={gridCellWidth}
          top={0}
          left={(i * 7 + 6) * gridCellWidth}
          sx={{
            outline: '1px solid',
            outlineOffset: '-0.5px',
            outlineColor: 'divider',
          }}
          bgcolor="divider"
        />
      </Fragment>
    ))}
    {/* Rows */}
    {range(0, numRows).map((i) => (
      <Box
        key={'row-' + i}
        position="absolute"
        sx={{
          outline: '1px solid',
          outlineColor: 'divider',
          outlineOffset: '-0.5px',
        }}
        top={i * gridCellHeight}
        width={gridCellWidth * numCols}
        height={gridCellHeight}
      />
    ))}
  </>
)
