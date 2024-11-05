import dayjs from 'dayjs'

export const dataExtractionPrompt = `
You are a tool for extracting relevant information from uploaded files within a supply chain procurement application.
Most often, these files will come from an email and the files will contain the text or HTML content of the email, along with the email attachments. Sometimes the information will be in the email, attachments, or both.
You will need to do your best to extract the information from the files and return it in a JSON object that matches the output schema.
`

// use dayjs (if needed) to coerce the date string to ISO 8601 format
export const coerceDateStringToISO8601 = (
  dateString: string | undefined,
): string | undefined =>
  dateString && dayjs(dateString).isValid()
    ? dayjs(dateString).toISOString()
    : undefined
