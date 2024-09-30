import { ZodType, z } from 'zod'

export type File = {
  id: string;
  accountId: string;
  blobId: string;
  name: string;
  contentType: string;
  downloadPath: string;
  previewPath: string;
};

export type JsFile = globalThis.File;

export const FileSchema: ZodType<File> = z.object({
  id: z.string(),
  accountId: z.string(),
  blobId: z.string(),
  name: z.string(),
  contentType: z.string(),
  downloadPath: z.string(),
  previewPath: z.string(),
})
