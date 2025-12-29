import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Activation {
  channel: number
  image: string
}

interface ActivationGridProps {
  layerName: string | null
  activations: Activation[]
  onClose: () => void
  loading: boolean
}

export function ActivationGrid({ layerName, activations, onClose, loading }: ActivationGridProps) {
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const perPage = 24
  
  const totalPages = Math.ceil(activations.length / perPage)
  const visibleActivations = activations.slice(page * perPage, (page + 1) * perPage)

  if (!layerName) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Select a layer to view activations</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Activations
          </h2>
          <p className="text-lg font-semibold text-gray-900">{layerName}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-3 flex-1 overflow-y-auto">
            <AnimatePresence>
              {visibleActivations.map((act) => (
                <motion.button
                  key={act.channel}
                  onClick={() => setSelectedChannel(
                    selectedChannel === act.channel ? null : act.channel
                  )}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedChannel === act.channel
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={`data:image/png;base64,${act.image}`}
                    alt={`Channel ${act.channel}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {page * perPage + 1}–{Math.min((page + 1) * perPage, activations.length)} of {activations.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-sm disabled:opacity-40"
              >
                ‹
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-sm disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
