import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import BrushProvider from './contexts/brush/BrushProvider.tsx'
import LayersProvider from './contexts/layers/LayersProvider.tsx'
import ModelProvider from './contexts/model/ModelProvider.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ModelProvider>
      <LayersProvider>
        <BrushProvider>
          <App />
        </BrushProvider>
      </LayersProvider>
    </ModelProvider>
  </React.StrictMode>,
)
