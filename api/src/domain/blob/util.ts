export const createDataUrl = (params: {
  mimeType: string
  buffer: Buffer
}): string =>
  `data:${params.mimeType};base64,${params.buffer.toString('base64')}`
