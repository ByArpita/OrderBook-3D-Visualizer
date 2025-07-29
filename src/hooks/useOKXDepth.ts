import { useEffect, useRef } from 'react'
import { useOrderbookStore } from '@/store/orderbook'

export function useOKXDepth(symbol = 'BTC-USDT', channel = 'books5') {
  const ws = useRef<WebSocket | null>(null)
  const setData = useOrderbookStore(s => s.setData)

  useEffect(() => {
    const url = 'wss://ws.okx.com:8443/ws/v5/public'
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      const subscribeMsg = {
        op: 'subscribe',
        args: [
          {
            channel,
            instId: symbol,
          },
        ],
      }
      ws.current?.send(JSON.stringify(subscribeMsg))
    }

    ws.current.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data)

        if (!msg.data || !msg.data[0]) return

        const snapshot = msg.data[0]
        const rawBids = snapshot.bids || []
        const rawAsks = snapshot.asks || []

        let cumulativeBid = 0
        const bids = rawBids.map(([p, q]: [string, string]) => {
          const quantity = parseFloat(q)
          cumulativeBid += quantity
          return { price: parseFloat(p), quantity: cumulativeBid }
        })

        let cumulativeAsk = 0
        const asks = rawAsks.map(([p, q]: [string, string]) => {
          const quantity = parseFloat(q)
          cumulativeAsk += quantity
          return { price: parseFloat(p), quantity: cumulativeAsk }
        })

        if (bids.length) setData('OKX', 'bid', bids)
        if (asks.length) setData('OKX', 'ask', asks)
      } catch (err) {
        console.warn('Failed to parse OKX message:', err)
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
  }, [symbol, channel, setData])
}
