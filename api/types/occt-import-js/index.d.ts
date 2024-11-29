// declare module 'occt-import-js' {
//   declare type Occt = {
//     ReadStepFile: (fileBuffer: Uint8Array, arg2: null) => unknown
//   }

//   declare function occtImport(): Promise<Occt>

//   export default occtImport
// }
declare module 'occt-import-js' {
  declare type Occt = {
    ReadStepFile: (
      fileBuffer: Uint8Array,
      params: {
        linearUnit?: 'millimeter' | 'centimeter' | 'meter' | 'inch' | 'foot'
        linearDeflectionType?: 'bounding_box_ratio' | 'absolute_value'
        linearDeflection?: number
        angularDeflection?: number
      } | null,
    ) => {
      success: boolean
      root: {
        name: string
        meshes: number[]
        children: {
          name: string
          meshes: number[]
          children: unknown[]
        }[]
      }
      meshes: {
        name: string
        color?: [number, number, number]
        brep_faces: {
          first: number
          last: number
          color: [number, number, number] | null
        }[]
        attributes: {
          position: {
            array: number[]
          }
          normal?: {
            array: number[]
          }
        }
        index: {
          array: number[]
        }
      }[]
    }
    ReadBrepFile: (
      fileBuffer: Uint8Array,
      params: {
        linearUnit?: 'millimeter' | 'centimeter' | 'meter' | 'inch' | 'foot'
        linearDeflectionType?: 'bounding_box_ratio' | 'absolute_value'
        linearDeflection?: number
        angularDeflection?: number
      } | null,
    ) => unknown
    ReadIgesFile: (
      fileBuffer: Uint8Array,
      params: {
        linearUnit?: 'millimeter' | 'centimeter' | 'meter' | 'inch' | 'foot'
        linearDeflectionType?: 'bounding_box_ratio' | 'absolute_value'
        linearDeflection?: number
        angularDeflection?: number
      } | null,
    ) => unknown
  }

  declare function occtImport(): Promise<Occt>

  export default occtImport
}
