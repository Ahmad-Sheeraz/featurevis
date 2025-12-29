import { motion } from 'framer-motion'
import { ModelUpload } from './ModelUpload'

interface LayerInfo {
  type: string
  in_channels: number
  out_channels: number
  kernel_size: number[]
}

interface ModelInfo {
  name: string
  input_size: number
  normalization: {
    mean: number[]
    std: number[]
  }
  num_layers: number
}

interface LayerSidebarProps {
  layers: string[]
  layerInfo: Record<string, LayerInfo>
  selectedLayer: string | null
  onSelect: (layer: string) => void
  modelInfo: ModelInfo | null
  onModelChange: () => void
}

export function LayerSidebar({ layers, layerInfo, selectedLayer, onSelect, modelInfo, onModelChange }: LayerSidebarProps) {
  return (
    <div className="w-56 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">◐ FeatureVis</h1>
      </div>
      
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Model
        </h2>
        <ModelUpload modelInfo={modelInfo} onModelChange={onModelChange} />
      </div>
      
      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Layers
        </h2>
        
        <div className="space-y-1 flex-1 overflow-y-auto">
          {layers.map((layer) => (
            <motion.button
              key={layer}
              onClick={() => onSelect(layer)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                selectedLayer === layer
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  selectedLayer === layer ? 'bg-gray-900' : 'bg-gray-300'
                }`} />
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {layer}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {layerInfo[layer]?.out_channels}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {layers.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-400 text-sm">
          Upload an image to see layers
        </div>
      )}
    </div>
  )
}
