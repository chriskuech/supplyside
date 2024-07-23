'use client'

import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import HistoryIcon from '@mui/icons-material/History'
import { useState } from 'react'
import { Check } from '@mui/icons-material'
import { setActiveRevision } from './actions'
import { Resource } from '@/domain/resource/types'

type Props = {
  resources: Resource[]
}

export default function RevisionsControl({ resources }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <IconButton>
        <HistoryIcon />
      </IconButton>
      <Drawer anchor={'right'} open={isOpen} onClose={() => setIsOpen(false)}>
        <Typography variant="h6">Revisions</Typography>
        <List>
          {resources.map((resource) => (
            <ListItemButton
              key={resource.id}
              onClick={() => setActiveRevision(resource.id)}
            >
              {resource.isActive && (
                <ListItemIcon>
                  <Check />
                </ListItemIcon>
              )}
              <ListItemText
                primary={
                  <>
                    Revision <b>{resource.rev}</b>
                  </>
                }
                secondary={resource.createdAt.toLocaleString()}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  )
}
