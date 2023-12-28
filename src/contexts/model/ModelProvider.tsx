import { useState } from 'react'
import { ModelContext, initialState } from './useModel'

export default function ModelProvider({ children }: React.PropsWithChildren) {
  const [model, setModel] = useState(initialState.model)

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  )
}
