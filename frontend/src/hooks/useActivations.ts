import { useState, useCallback, useEffect } from 'react'
import { uploadImage, getLayers, getActivations, getModelInfo } from '../services/api'

interface LayerInfo {
  type: string
  in_channels: number
  out_channels: number
  kernel_size: number[]
}

interface Activation {
  channel: number
  image: string
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

interface ActivationsState {
  layers: string[]
  layerInfo: Record<string, LayerInfo>
  selectedLayer: string | null
  activations: Activation[]
  predictions: { top5_indices: number[]; top5_probs: number[] } | null
  modelInfo: ModelInfo | null
  loading: boolean
  error: string | null
}

export function useActivations() {
  const [state, setState] = useState<ActivationsState>({
    layers: [],
    layerInfo: {},
    selectedLayer: null,
    activations: [],
    predictions: null,
    modelInfo: null,
    loading: false,
    error: null,
  })

  const fetchModelInfo = useCallback(async () => {
    try {
      const info = await getModelInfo()
      setState(prev => ({ ...prev, modelInfo: info }))
    } catch (err) {
      console.error('Failed to fetch model info:', err)
    }
  }, [])

  useEffect(() => {
    fetchModelInfo()
  }, [fetchModelInfo])

  const handleUpload = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const uploadResult = await uploadImage(file)
      const layersResult = await getLayers()
      
      setState(prev => ({
        ...prev,
        layers: layersResult.layers,
        layerInfo: layersResult.info,
        predictions: uploadResult.predictions,
        modelInfo: uploadResult.model_info,
        loading: false,
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to process image',
      }))
    }
  }, [])

  const selectLayer = useCallback(async (layerName: string) => {
    setState(prev => ({ ...prev, loading: true, selectedLayer: layerName }))
    
    try {
      const result = await getActivations(layerName)
      
      setState(prev => ({
        ...prev,
        activations: result.activations,
        loading: false,
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load activations',
      }))
    }
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedLayer: null,
      activations: [],
    }))
  }, [])

  const refreshModel = useCallback(async () => {
    await fetchModelInfo()
    const layersResult = await getLayers()
    setState(prev => ({
      ...prev,
      layers: layersResult.layers,
      layerInfo: layersResult.info,
      selectedLayer: null,
      activations: [],
    }))
  }, [fetchModelInfo])

  return {
    ...state,
    handleUpload,
    selectLayer,
    clearSelection,
    refreshModel,
  }
}
