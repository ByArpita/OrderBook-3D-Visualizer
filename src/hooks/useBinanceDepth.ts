import { useEffect, useRef } from 'react'
import { useOrderbookStore } from '@/store/orderbook'
import { any } from 'three/tsl'

export function useBinanceDepth(symbol: string = 'btcusdt', interval = 100) {
  const ws = useRef<WebSocket | null>(null)
  const setData = useOrderbookStore(s => s.setData)

  useEffect(() => {
    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@${interval}ms`
    ws.current = new WebSocket(url)

    ws.current.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data)
        
          let cumulativeBid = 0
          const bids = msg.b.map(([p, q]: [string, string]) => {
            const quantity = parseFloat(q)
            cumulativeBid += quantity
            return { price: +p, quantity: cumulativeBid }
          })

          let cumulativeAsk = 0
          const asks = msg.a.map(([p, q]: [string, string]) => {
            const quantity = parseFloat(q)
            cumulativeAsk += quantity
            return { price: +p, quantity: cumulativeAsk }
          })

        if (bids.length) setData('Binance', 'bid', bids)
        if (asks.length) setData('Binance', 'ask', asks)

        console.log(`Received: ${bids.length} bids, ${asks.length} asks`)
      } catch (err) {
        console.warn('Failed to parse Binance depth message:', err)
      }
    }

    ws.current.onerror = () => {
      console.error('WebSocket error, retrying in 5s')
      setTimeout(() => window.location.reload(), 5000)
    }

    ws.current.onclose = () => {
      console.warn('WebSocket closed, attempting reconnection')
      setTimeout(() => window.location.reload(), 5000)
    }


    return () => {
      ws.current?.close()
    }
  }, [symbol, interval, setData])
}
