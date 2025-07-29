import { useEffect, useRef } from 'react'
import { useOrderbookStore } from '@/store/orderbook'

export function useBybitDepth(symbol = 'BTCUSDT') {
  const ws = useRef<WebSocket | null>(null)
  const setData = useOrderbookStore(s => s.setData)

  useEffect(() => {
    const url = 'wss://stream.bybit.com/v5/public/spot'
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      const payload = {
        op: 'subscribe',
        args: [`orderbook.50.${symbol}`],
      }
      ws.current?.send(JSON.stringify(payload))
    }

    ws.current.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data)
        if (!msg?.data?.b || !msg?.data?.a) return

        let cumulativeBid = 0
        const bids = msg.data.b.map(([p, q]: [string, string]) => {
          const quantity = parseFloat(q)
          cumulativeBid += quantity
          return { price: +p, quantity: cumulativeBid }
        })

        let cumulativeAsk = 0
        const asks = msg.data.a.map(([p, q]: [string, string]) => {
          const quantity = parseFloat(q)
          cumulativeAsk += quantity
          return { price: +p, quantity: cumulativeAsk }
        })

        setData('Bybit', 'bid', bids)
        setData('Bybit', 'ask', asks)
      } catch (err) {
        console.warn('Bybit WS error:', err)
      }
    }

    ws.current.onerror = () => {
      console.error('Bybit WebSocket error. Retrying...')
      setTimeout(() => window.location.reload(), 5000)
    }

    ws.current.onclose = () => {
      console.warn('Bybit WebSocket closed. Reconnecting...')
      setTimeout(() => window.location.reload(), 5000)
    }

    return () => {
      ws.current?.close()
    }
  }, [symbol, setData])
}
