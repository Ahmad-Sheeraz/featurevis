import { useState } from 'react'
import { LayerSidebar } from './components/LayerSidebar'
import { ImageViewer } from './components/ImageViewer'
import { ActivationGrid } from './components/ActivationGrid'
import { AttributionPanel } from './components/AttributionPanel'
import { useActivations } from './hooks/useActivations'

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  const {
    layers,
    layerInfo,
    selectedLayer,
    activations,
    predictions,
    modelInfo,
    loading,
    handleUpload,
    selectLayer,
    clearSelection,
    refreshModel,
  } = useActivations()

  const onUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    handleUpload(file)
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <LayerSidebar
        layers={layers}
        layerInfo={layerInfo}
        selectedLayer={selectedLayer}
        onSelect={selectLayer}
        modelInfo={modelInfo}
        onModelChange={refreshModel}
      />
      
      <div className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col gap-4">
          <ImageViewer
            imageUrl={imageUrl}
            onUpload={onUpload}
            predictions={predictions}
          />
          <AttributionPanel
            selectedLayer={selectedLayer}
            hasImage={imageUrl !== null}
          />
        </div>
        
        <ActivationGrid
          layerName={selectedLayer}
          activations={activations}
          onClose={clearSelection}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default App
