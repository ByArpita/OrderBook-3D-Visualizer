'use client'
import { useHasMounted } from '@/hooks/useHasMounted'
import { useOrderbookStore } from '@/store/orderbook'

const VENUES = ['Binance','OKX','Bybit','Deribit']
const COLORS: Record<string,string> = {
  Binance:'#00c853', OKX:'#ff6d00', Bybit:'#00bcd4', Deribit:'#9c27b0'
}

export default function VenueFilter(){
  const hasMounted = useHasMounted()
  const { selectedVenues, toggleVenue } = useOrderbookStore()

  if (!hasMounted) return null // ⛔ prevent SSR mismatch
  return (
    <div className="flex space-x-2">
      {VENUES.map(v=>{
        const active = selectedVenues.includes(v)
        return (
          <button
            key={v}
            onClick={()=>toggleVenue(v)}
            className={`
              px-3 py-1 rounded 
              ${active 
                ? `bg-[${COLORS[v]}] text-white`
                : 'bg-gray-700 text-gray-300'}
            `}
          >
            {v}
          </button>
        )
      })}
    </div>
  )
}
