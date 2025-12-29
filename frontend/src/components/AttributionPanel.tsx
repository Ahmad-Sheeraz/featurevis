import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  computeGradCAM,
  computeGuidedGradCAM,
  computeSaliency,
  computeIntegratedGradients,
  computeOcclusion,
} from '../services/api'

interface AttributionPanelProps {
  selectedLayer: string | null
  hasImage: boolean
}

interface AttributionResult {
  method: string
  heatmap: string
  target_class: number
}

export function AttributionPanel({ selectedLayer, hasImage }: AttributionPanelProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AttributionResult | null>(null)
  const [activeMethod, setActiveMethod] = useState<string | null>(null)

  const runAttribution = async (method: string) => {
    if (!hasImage) return
    
    setLoading(true)
    setActiveMethod(method)
    
    try {
      let response
      
      switch (method) {
        case 'gradcam':
          if (!selectedLayer) {
            alert('Select a layer first for GradCAM')
            setLoading(false)
            return
          }
          response = await computeGradCAM(selectedLayer)
          break
        case 'guided_gradcam':
          if (!selectedLayer) {
            alert('Select a layer first for Guided GradCAM')
            setLoading(false)
            return
          }
          response = await computeGuidedGradCAM(selectedLayer)
          break
        case 'saliency':
          response = await computeSaliency()
          break
        case 'integrated_gradients':
          response = await computeIntegratedGradients(50)
          break
        case 'occlusion':
          response = await computeOcclusion(15, 8)
          break
        default:
          return
      }
      
      setResult(response)
    } catch (err) {
      console.error('Attribution error:', err)
    } finally {
      setLoading(false)
    }
  }

  const methods = [
    { id: 'gradcam', name: 'GradCAM', needsLayer: true },
    { id: 'guided_gradcam', name: 'Guided GradCAM', needsLayer: true },
    { id: 'saliency', name: 'Saliency', needsLayer: false },
    { id: 'integrated_gradients', name: 'Int. Gradients', needsLayer: false },
    { id: 'occlusion', name: 'Occlusion', needsLayer: false },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Attribution
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => runAttribution(method.id)}
            disabled={!hasImage || loading || (method.needsLayer && !selectedLayer)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeMethod === method.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {method.name}
          </button>
        ))}
      </div>
      
      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Computing...
        </div>
      )}
      
      {!loading && result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="aspect-square rounded-xl overflow-hidden border border-gray-100">
            <img
              src={`data:image/png;base64,${result.heatmap}`}
              alt="Attribution"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {result.method} · Class {result.target_class}
          </div>
        </motion.div>
      )}
      
      {!loading && !result && (
        <div className="text-center py-4 text-gray-400 text-xs">
          {hasImage ? 'Select a method above' : 'Upload an image first'}
        </div>
      )}
    </div>
  )
}
