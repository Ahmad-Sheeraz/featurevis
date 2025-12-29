import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadModel, uploadCustomModel, CustomModelConfig } from '../services/api'

interface ModelInfo {
  name: string
  input_size: number
  normalization: {
    mean: number[]
    std: number[]
  }
  num_layers: number
}

interface ModelUploadProps {
  modelInfo: ModelInfo | null
  onModelChange: () => void
}

export function ModelUpload({ modelInfo, onModelChange }: ModelUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [config, setConfig] = useState<CustomModelConfig>({
    inputSize: 224,
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    architecture: 'resnet18',
  })

  const presetModels = ['resnet18', 'resnet50', 'vgg16']

  const handlePresetLoad = async (modelName: string) => {
    setLoading(true)
    setError(null)
    try {
      await loadModel(modelName)
      onModelChange()
      setIsOpen(false)
    } catch (err) {
      setError('Failed to load model')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomUpload = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const result = await uploadCustomModel(file, config)
      if (result.status === 'error') {
        setError(result.error)
      } else {
        onModelChange()
        setIsOpen(false)
        setShowCustom(false)
      }
    } catch (err) {
      setError('Failed to upload model')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleCustomUpload(file)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
      >
        <span className="truncate">{modelInfo?.name || 'No model'}</span>
        <span className="text-xs text-gray-400 ml-2">
          {modelInfo?.input_size}px
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Pretrained Models
              </h3>
            </div>

            <div className="p-2">
              {presetModels.map((model) => (
                <button
                  key={model}
                  onClick={() => handlePresetLoad(model)}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    modelInfo?.name === model
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {model}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="w-full text-left text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between"
              >
                Custom Model
                <span>{showCustom ? '−' : '+'}</span>
              </button>
            </div>

            <AnimatePresence>
              {showCustom && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-3 bg-gray-50">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Architecture</label>
                      <select
                        value={config.architecture || ''}
                        onChange={(e) => setConfig({ ...config, architecture: e.target.value || undefined })}
                        className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
                      >
                        <option value="resnet18">ResNet-18</option>
                        <option value="resnet50">ResNet-50</option>
                        <option value="vgg16">VGG-16</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Input Size</label>
                      <input
                        type="number"
                        value={config.inputSize}
                        onChange={(e) => setConfig({ ...config, inputSize: parseInt(e.target.value) || 224 })}
                        className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Mean (R, G, B)</label>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <input
                            key={i}
                            type="number"
                            step="0.001"
                            value={config.mean[i]}
                            onChange={(e) => {
                              const newMean = [...config.mean] as [number, number, number]
                              newMean[i] = parseFloat(e.target.value) || 0
                              setConfig({ ...config, mean: newMean })
                            }}
                            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Std (R, G, B)</label>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <input
                            key={i}
                            type="number"
                            step="0.001"
                            value={config.std[i]}
                            onChange={(e) => {
                              const newStd = [...config.std] as [number, number, number]
                              newStd[i] = parseFloat(e.target.value) || 0
                              setConfig({ ...config, std: newStd })
                            }}
                            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload .pt / .pth file'}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pt,.pth"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs">
                {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
