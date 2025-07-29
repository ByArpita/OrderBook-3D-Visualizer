import { create } from 'zustand'

export interface OrderbookLevel {
  price: number
  quantity: number
}
export type Side = 'bid' | 'ask'

interface VenueData {
  bid: OrderbookLevel[]
  ask: OrderbookLevel[]
}
interface OrderbookState {
  data: Record<string, VenueData>
  selectedVenues: string[]
  venues: string[]
  activeVenues: Set<string>
  setData: (venue: string, side: Side, levels: OrderbookLevel[]) => void
  toggleVenue: (venue: string) => void
}

export const useOrderbookStore = create<OrderbookState>(set => ({
  data: {},
  selectedVenues: ['Binance'],    // default selection
  venues: ['Binance', 'OKX', 'Bybit', 'Deribit'],                   
  activeVenues: new Set(), 
  setData: (venue, side, levels) =>
    set(state => ({
      data: {
        ...state.data,
        [venue]: {
          ...state.data[venue],
          [side]: levels,
        },
      },
    })),
  toggleVenue: (venue) =>
  set((state) => {
    const isSelected = state.selectedVenues.includes(venue)
    const selectedVenues = isSelected
      ? state.selectedVenues.filter((v) => v !== venue)
      : [...state.selectedVenues, venue]
    return {
      selectedVenues,
      activeVenues: new Set(selectedVenues), // sync activeVenues here
    }
  }),
}))
