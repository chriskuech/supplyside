declare module 'occt-import-js' {
  declare type Occt = {
    ReadStepFile: (fileBuffer: Uint8Array, arg2: null) => unknown
  }

  declare function occtImport(): Promise<Occt>

  export default occtImport
}
