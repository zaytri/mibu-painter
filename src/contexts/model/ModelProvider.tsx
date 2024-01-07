import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { ModelContext, initialState } from './useModel'

export default function ModelProvider({ children }: React.PropsWithChildren) {
  const [model, setModel] = useState(initialState.model)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // loadModel('camel')
  }, [])

  const readPublicModel = useCallback(
    async (modelName: string): Promise<Minecraft.Model> => {
      const response = await axios.get(`/models/${modelName}.geo.json`)
      return response.data
    },
    [],
  )

  const readCustomModel = useCallback(
    async (file: File): Promise<Minecraft.Model> => {
      return new Promise<Minecraft.Model>((resolve, reject) => {
        const fileReader = new FileReader()

        fileReader.onload = event => {
          if (!event.target || typeof event.target.result !== 'string') {
            reject()
          } else {
            resolve(JSON.parse(event.target.result))
          }
        }
        fileReader.onerror = error => reject(error)
        fileReader.readAsText(file)
      })
    },
    [],
  )

  const loadModel = useCallback(
    async (modelFile: string | File) => {
      setLoading(true)
      try {
        const modelData =
          typeof modelFile === 'string'
            ? await readPublicModel(modelFile)
            : await readCustomModel(modelFile)
        setModel(modelData['minecraft:geometry'][0])
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setModel],
  )

  return (
    <ModelContext.Provider value={{ model, loading, loadModel }}>
      {children}
    </ModelContext.Provider>
  )
}
