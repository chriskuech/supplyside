'use client'

import assert from 'assert'
import Editor, { EditorProps } from '@monaco-editor/react'
import { useTheme } from '@mui/material'
import { FC } from 'react'
import { match } from 'ts-pattern'

export const ClientEditor: FC<EditorProps> = (props) => {
  const {
    palette: { mode: theme },
  } = useTheme()

  assert(theme, 'theme is required')

  return (
    <Editor
      theme={match(theme)
        .with('dark', () => 'vs-dark')
        .with('light', () => 'vs')
        .exhaustive()}
      {...props}
    />
  )
}
