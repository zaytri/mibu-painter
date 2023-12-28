import playerSlim from '@/models/player_slim.geo.json'
import { promises as fileSystem } from 'fs'
import { createContext, useContext, useState } from 'react'

export function useModel() {
  const [loading, setLoading] = useState(false)
  const { model, setModel } = useContext(ModelContext)

  async function loadGeometry(modelFile: string | File) {
    // setLoading(true)
    // try {
    //   const fileText =
    //     typeof modelFile === 'string'
    //       ? await fileSystem.readFile(`/models/${modelFile}.geo.json`, 'utf-8')
    //       : await readUploadedFile(modelFile)
    //   setModel(JSON.parse(fileText))
    // } finally {
    //   setLoading(false)
    // }
  }

  return { loading, model, loadGeometry }
}

async function readUploadedFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.onload = event => {
      if (!event.target || typeof event.target.result !== 'string') {
        reject()
      } else {
        resolve(event.target.result)
      }
    }
    fileReader.onerror = error => reject(error)
    fileReader.readAsText(file)
  })
}

export const initialState: ModelState = {
  model: playerSlim['minecraft:geometry'][0],
  setModel() {},
}
export const ModelContext = createContext<ModelState>(initialState)

type ModelState = {
  model: Minecraft.Geometry
  setModel: (geometry: Minecraft.Geometry) => void
}
