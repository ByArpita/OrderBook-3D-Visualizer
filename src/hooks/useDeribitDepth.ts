import { useEffect, useRef } from 'react'
import { useOrderbookStore } from '@/store/orderbook'

export function useDeribitDepth(symbol = 'BTC-PERPETUAL') {
  const ws = useRef<WebSocket | null>(null)
  const setData = useOrderbookStore(s => s.setData)

  useEffect(() => {
    const url = 'wss://www.deribit.com/ws/api/v2'
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'public/subscribe',
        params: {
          channels: [`book.${symbol}.raw`],
        },
      }
      ws.current?.send(JSON.stringify(payload))
    }

    ws.current.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data)
        const book = msg?.params?.data
        if (!book?.bids || !book?.asks) return

        let cumulativeBid = 0
        const bids = book.bids.map(([p, q]: [number, number]) => {
          cumulativeBid += q
          return { price: p, quantity: cumulativeBid }
        })

        let cumulativeAsk = 0
        const asks = book.asks.map(([p, q]: [number, number]) => {
          cumulativeAsk += q
          return { price: p, quantity: cumulativeAsk }
        })

        setData('Deribit', 'bid', bids)
        setData('Deribit', 'ask', asks)
      } catch (err) {
        console.warn('Deribit WS error:', err)
      }
    }

    ws.current.onerror = () => {
      console.error('Deribit WebSocket error. Retrying...')
      setTimeout(() => window.location.reload(), 5000)
    }

    ws.current.onclose = () => {
      console.warn('Deribit WebSocket closed. Reconnecting...')
      setTimeout(() => window.location.reload(), 5000)
    }

    return () => {
      ws.current?.close()
    }
  }, [symbol, setData])
}
