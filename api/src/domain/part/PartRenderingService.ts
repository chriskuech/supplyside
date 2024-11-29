import { File } from '@supplyside/model'
import { createCanvas } from 'canvas'
import { inject, injectable } from 'inversify'
import { Occt } from 'occt-import-js'
import { BlobService } from '../blob/BlobService'
import { FileService } from '../file/FileService'

@injectable()
export class PartRenderingService {
  constructor(
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(FileService) private readonly fileService: FileService,
  ) {}

  async render(accountId: string, blobId: string): Promise<File> {
    const stepBlob = await this.blobService.readBlobWithData(accountId, blobId)

    const pngBuffer = await PartRenderingService.renderStpToPng(stepBlob.buffer)

    const pngBlob = await this.blobService.createBlob(accountId, {
      buffer: pngBuffer,
      contentType: 'image/png',
    })

    const file = await this.fileService.create(accountId, {
      blobId: pngBlob.id,
      name: 'thumbnail.png',
    })

    return file
  }

  private static async renderStpToPng(stpBuffer: Buffer): Promise<Buffer> {
    // Load the OpenCascade instance
    const occt = await Occt.create()

    try {
      // Import the STEP file
      const shapes = occt.readSTEP(stpBuffer.toString('base64'))
      if (!shapes || shapes.length === 0) {
        throw new Error('No shapes found in the STEP file.')
      }

      // Create a canvas
      const width = 1024
      const height = 1024
      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')

      // Set up rendering context
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = 'black'
      ctx.lineWidth = 1

      // Extract triangles and render
      shapes.forEach((shape) => {
        const mesh = occt.tesselate(shape, 0.1) // Tolerance for tessellation

        mesh.triangles.forEach((triangle) => {
          const [p1, p2, p3] = triangle

          // Scale and translate for better visibility
          const scale = Math.min(width, height) * 0.8
          const offsetX = width / 2
          const offsetY = height / 2

          const project = (point: [number, number, number]) => [
            offsetX + point[0] * scale,
            offsetY - point[1] * scale,
          ]

          const [x1, y1] = project(p1)
          const [x2, y2] = project(p2)
          const [x3, y3] = project(p3)

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.lineTo(x3, y3)
          ctx.closePath()
          ctx.stroke()
        })
      })

      // Export the canvas to a PNG buffer
      return canvas.toBuffer('image/png')
    } finally {
      occt.delete()
    }
  }
}
