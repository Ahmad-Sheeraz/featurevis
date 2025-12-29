const API_BASE = '/api'

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })
  
  return response.json()
}

export async function getLayers() {
  const response = await fetch(`${API_BASE}/layers`)
  return response.json()
}

export async function getActivations(layerName: string) {
  const response = await fetch(`${API_BASE}/activations/${encodeURIComponent(layerName)}`)
  return response.json()
}

export async function getActivationChannel(layerName: string, channel: number) {
  const response = await fetch(`${API_BASE}/activations/${encodeURIComponent(layerName)}?channel=${channel}`)
  return response.json()
}

export async function getModels() {
  const response = await fetch(`${API_BASE}/models`)
  return response.json()
}

export async function loadModel(modelName: string) {
  const response = await fetch(`${API_BASE}/models/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_name: modelName }),
  })
  return response.json()
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE}/models/info`)
  return response.json()
}

export interface CustomModelConfig {
  inputSize: number
  mean: [number, number, number]
  std: [number, number, number]
  architecture?: string
}

export async function uploadCustomModel(file: File, config: CustomModelConfig) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('input_size', config.inputSize.toString())
  formData.append('mean_r', config.mean[0].toString())
  formData.append('mean_g', config.mean[1].toString())
  formData.append('mean_b', config.mean[2].toString())
  formData.append('std_r', config.std[0].toString())
  formData.append('std_g', config.std[1].toString())
  formData.append('std_b', config.std[2].toString())
  if (config.architecture) {
    formData.append('architecture', config.architecture)
  }
  
  const response = await fetch(`${API_BASE}/models/upload`, {
    method: 'POST',
    body: formData,
  })
  
  return response.json()
}

export async function getAttributionMethods() {
  const response = await fetch(`${API_BASE}/attribution/methods`)
  return response.json()
}

export async function computeGradCAM(layerName: string) {
  const response = await fetch(`${API_BASE}/attribution/gradcam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layer_name: layerName }),
  })
  return response.json()
}

export async function computeGuidedGradCAM(layerName: string) {
  const response = await fetch(`${API_BASE}/attribution/guided_gradcam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layer_name: layerName }),
  })
  return response.json()
}

export async function computeSaliency() {
  const response = await fetch(`${API_BASE}/attribution/saliency`, {
    method: 'POST',
  })
  return response.json()
}

export async function computeIntegratedGradients(steps: number = 50) {
  const response = await fetch(`${API_BASE}/attribution/integrated_gradients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps }),
  })
  return response.json()
}

export async function computeOcclusion(windowSize: number = 15, stride: number = 8) {
  const response = await fetch(`${API_BASE}/attribution/occlusion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ window_size: windowSize, stride }),
  })
  return response.json()
}
