export const createDataUrl = (params: {
  contentType: string
  buffer: Buffer
}): string =>
  `data:${params.contentType};base64,${params.buffer.toString('base64')}`
