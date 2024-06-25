'use client'

import { fail } from 'assert'
import {
  DetailedHTMLProps,
  FormHTMLAttributes,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'

type FormProps = DetailedHTMLProps<
  FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>

type State = {
  data: FormData
  clear: () => void
}

const context = createContext<null | State>(null)

export default function ResourceFormContext(props: FormProps) {
  const [data, setData] = useState<FormData>(new FormData())

  const clear = useCallback(() => setData(new FormData()), [])

  return (
    <context.Provider value={{ data, clear }}>
      <form
        {...props}
        onSubmit={(...args) => {
          props.onSubmit?.(...args)
          clear()
        }}
        onReset={clear}
      />
    </context.Provider>
  )
}

export const useResourceFormContext = () =>
  useContext(context) ?? fail('ResourceFormContext not found')
