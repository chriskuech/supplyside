import { OsService } from '@supplyside/api/os'
import { readFile, writeFile } from 'fs/promises'
import { inject, injectable } from 'inversify'
import { BlobService } from './BlobService'
import { Blob } from './entity'

@injectable()
export class ThumbnailRenderService {
  constructor(
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(OsService) private readonly osService: OsService,
  ) {}

  static get scriptPath() {
    return `${OsService.dataPath}/render_step.tcl`
  }

  renderStepBlobToPng(accountId: string, blobId: string): Promise<Blob> {
    return this.osService.withTempDir(async (tempDirPath) => {
      const stepPath = `${tempDirPath}/input.stp`
      const thumbnailPath = `${tempDirPath}/thumbnail.png`
      const stlPath = `${tempDirPath}/model.stl`

      const { buffer: stepBuffer } = await this.blobService.readBlobWithData(
        accountId,
        blobId,
      )
      await writeFile(stepPath, stepBuffer)

      // const script = `
      //   pload ALL ;
      //   stepread ${stepPath} my_shape ;
      //   vinit -width 200 -height 200 ;
      //   vdisplay my_shape -quality 2 ;
      //   vfit ;
      //   vexport ${thumbnailPath} PNG ;
      //   exit ;
      // `

      const script = `
        pload ALL ;
        stepread ${stepPath} my_shape ;
        stlwrite my_shape ${stlPath} ;
        exit ;
      `

      await OsService.exec(
        `yes 1 | drawexe -b -v -c "${script}" > "${tempDirPath}/log.txt"`,
        5 * 60_000,
      )

      const thumbnailBuffer = await readFile(thumbnailPath)
      const thumbnailBlob = await this.blobService.createBlob(accountId, {
        buffer: thumbnailBuffer,
        contentType: 'image/png',
      })

      return thumbnailBlob
    })
  }
}
