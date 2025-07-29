'use client'

import { useOrderbookStore } from '@/store/orderbook'

interface ControlPanelProps {
  autoRotate: boolean
  setAutoRotate: React.Dispatch<React.SetStateAction<boolean>>
  rotationSpeed: number
  setRotationSpeed: React.Dispatch<React.SetStateAction<number>>
}

const VENUE_COLORS: Record<string, string> = {
  Binance: '#00c853',
  OKX: '#ff6d00',
  Bybit: '#00bcd4',
  Deribit: '#9c27b0',
}

export default function ControlPanel({
  autoRotate,
  setAutoRotate,
  rotationSpeed,
  setRotationSpeed,
}: ControlPanelProps) {
  const venues = useOrderbookStore(state => state.venues || [])
  const activeVenues = useOrderbookStore(state => state.activeVenues)
  const toggleVenue = useOrderbookStore(state => state.toggleVenue)

  return (
    <div className="p-4 bg-white bg-opacity-90 dark:bg-gray-800 rounded-lg shadow-lg w-72 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Controls</h2>

      {/* Auto-Rotate Toggle */}
      <div className="space-y-1">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={e => setAutoRotate(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-200">Auto-Rotate</span>
        </label>
      </div>

      {/* Rotation Speed Slider */}
      <div className="space-y-1">
        <label htmlFor="speed" className="block text-sm text-gray-700 dark:text-gray-200">
          Speed: {rotationSpeed.toFixed(2)} rad/s
        </label>
        <input
          id="speed"
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={rotationSpeed}
          onChange={e => setRotationSpeed(+e.target.value)}
          className="w-full"
        />
      </div>

      <hr className="border-gray-300 dark:border-gray-600" />

      {/* Venue Filters */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Venues</h3>
        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-auto">
          {venues.map(v => {
            const active = activeVenues.has(v)
            return (
              <button
                key={v}
                onClick={() => toggleVenue(v)}
                className={`
                  text-sm font-semibold rounded px-2 py-1 w-full text-center transition-colors duration-200 border
                  ${active
                    ? 'text-white border-white shadow-sm'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-400'}
                `}
                style={active ? { backgroundColor: VENUE_COLORS[v] } : undefined}
              >
                {v}
              </button>

            )
          })}
        </div>
      </div>
    </div>
  )
}
