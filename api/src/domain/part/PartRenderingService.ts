import { File } from '@supplyside/model'
import { fail } from 'assert'
import { createCanvas } from 'canvas'
import Color from 'color'
import { inject, injectable } from 'inversify'
import occtImport from 'occt-import-js'
import { chunk, clamp, map, pipe } from 'remeda'
import { BlobService } from '../blob/BlobService'
import { FileService } from '../file/FileService'

type Vec2 = readonly [number, number]
type Vec3 = readonly [number, number, number]
type Triangle = readonly [Vec3, Vec3, Vec3]

const baseColor = Color('rgb(65, 154, 248)')
const lightSource: Vec3 = [1, 1, 1]
const lightIntensity = 2

const calculateLighting = (normal: Vec3): number => {
  const dotProduct =
    normal[0] * lightSource[0] +
    normal[1] * lightSource[1] +
    normal[2] * lightSource[2]
  const normalMagnitude = Math.sqrt(
    normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2,
  )
  const lightMagnitude = Math.sqrt(
    lightSource[0] ** 2 + lightSource[1] ** 2 + lightSource[2] ** 2,
  )
  const cosTheta = dotProduct / (normalMagnitude * lightMagnitude)
  return Math.max(0, cosTheta) * lightIntensity
}

const calculateNormal = ([p1, p2, p3]: Triangle): Vec3 => {
  const u: Vec3 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]
  const v: Vec3 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]]
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ]
}

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
    const occt = await occtImport()

    // Import the STEP file
    const result = occt.ReadStepFile(stpBuffer, null)
    if (!result.success) {
      throw new Error('Failed to import STEP file.')
    }

    const [mesh, ...extraMeshes] = result.meshes

    if (extraMeshes.length) {
      throw new Error('Expected exactly one mesh')
    }
    if (!mesh) {
      throw new Error('No mesh found')
    }

    const vertices = chunk(mesh.attributes.position.array, 3) as Vec3[]

    // Create a canvas
    const width = 1024
    const height = 1024
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Calculate bounding box to normalize size
    const minX = Math.min(...vertices.map(([x]) => x))
    const maxX = Math.max(...vertices.map(([x]) => x))
    const minY = Math.min(...vertices.map(([, y]) => y))
    const maxY = Math.max(...vertices.map(([, y]) => y))
    const minZ = Math.min(...vertices.map(([, , z]) => z))
    const maxZ = Math.max(...vertices.map(([, , z]) => z))

    const objectWidth = maxX - minX
    const objectHeight = maxY - minY
    const objectDepth = maxZ - minZ

    // Normalize vertices to fit into a unit cube centered at the origin
    const maxDimension = Math.max(objectWidth, objectHeight, objectDepth)
    const normalizedVertices = vertices.map(
      ([x, y, z]) =>
        [
          (x - (minX + maxX) / 2) / maxDimension,
          (y - (minY + maxY) / 2) / maxDimension,
          (z - (minZ + maxZ) / 2) / maxDimension,
        ] as const,
    )

    const scale = Math.min(width, height) * 0.9
    const offsetX = width / 2
    const offsetY = height / 2

    // Rotation matrix for 30 degrees around the x-axis
    const angle = Math.PI / 6 // 30 degrees in radians
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)

    const rotateX = ([x, y, z]: Vec3): Vec3 => [
      x,
      y * cosAngle - z * sinAngle,
      y * sinAngle + z * cosAngle,
    ]

    const project = ([x, y, z]: Vec3): Vec2 => {
      const [rx, ry] = rotateX([x, y, z])

      return [offsetX + rx * scale, offsetY - ry * scale]
    }

    // Extract meshes and render
    const triangles: Triangle[] = pipe(
      chunk(mesh.index.array, 3),
      map(
        ([a, b, c]) =>
          [
            normalizedVertices[a],
            normalizedVertices[b ?? fail()],
            normalizedVertices[c ?? fail()],
          ] as Triangle,
      ),
    )

    const calculateAverageZ = ([p1, p2, p3]: Triangle): number => {
      return (p1[2] + p2[2] + p3[2]) / 3
    }

    // Sort triangles by average Z value (back to front)
    const sortedTriangles = triangles.sort(
      (a, b) => calculateAverageZ(b) - calculateAverageZ(a),
    )

    // Render each triangle with flat shading and lighting
    for (const [p1, p2, p3] of sortedTriangles) {
      const faces = [
        [p1, p2, p3],
        [p3, p2, p1],
      ] as const

      for (const [p1, p2, p3] of faces) {
        const [p1x, p1y] = project(p1)
        const [p2x, p2y] = project(p2)
        const [p3x, p3y] = project(p3)

        const normal = calculateNormal([p1, p2, p3])

        const lighting = calculateLighting(normal)
        const shadedColor = baseColor
          .lightness(100 * clamp(lighting, { min: 0, max: 1 }))
          .hex()

        ctx.fillStyle = shadedColor
        ctx.beginPath()
        ctx.moveTo(p1x, p1y)
        ctx.lineTo(p2x, p2y)
        ctx.lineTo(p3x, p3y)
        ctx.closePath()
        ctx.fill()
      }
    }

    // Export the canvas to a PNG buffer
    return canvas.toBuffer('image/png')
  }
}
