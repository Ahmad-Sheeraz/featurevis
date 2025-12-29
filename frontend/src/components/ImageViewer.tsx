import { useRef } from 'react'

interface ImageViewerProps {
  imageUrl: string | null
  onUpload: (file: File) => void
  predictions: { top5_indices: number[]; top5_probs: number[] } | null
}

export function ImageViewer({ imageUrl, onUpload, predictions }: ImageViewerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div 
        onClick={handleClick}
        className="w-80 h-80 bg-white rounded-2xl border border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 transition-colors overflow-hidden"
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-8">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-500 text-sm">Click to upload image</p>
            <p className="text-gray-400 text-xs mt-1">224×224 recommended</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      
      {predictions && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Prediction
          </h3>
          <p className="text-lg font-semibold text-gray-900">
            Class {predictions.top5_indices[0]}
          </p>
          <p className="text-sm text-gray-500">
            {(predictions.top5_probs[0] * 100).toFixed(1)}% confidence
          </p>
        </div>
      )}
    </div>
  )
}
