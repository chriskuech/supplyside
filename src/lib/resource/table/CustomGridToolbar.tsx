import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
import React from 'react'

export default function CustomGridToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter
        quickFilterParser={(searchInput) =>
          searchInput
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
        }
        quickFilterFormatter={(quickFilterValues) =>
          quickFilterValues.join(', ')
        }
        debounceMs={200} // time before applying the new quick filter value
      />
    </GridToolbarContainer>
  )
}
