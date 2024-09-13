'use client'

import { ChangeEvent, useCallback, useState } from 'react'

export function useImagePreview() {
  const [image, setImage] = useState<string | null>(null)

  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const [file] = e.target.files ?? []

    if (file) {
      setImage(URL.createObjectURL(file))
    }
  }, [])

  return { image, handleImageChange }
}
