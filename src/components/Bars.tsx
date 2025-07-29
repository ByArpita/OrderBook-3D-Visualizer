'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useOrderbookStore } from '@/store/orderbook'
import { Text } from '@react-three/drei'

const BAR_WIDTH = 2
const BAR_DEPTH = 2
const HEIGHT_SCALE = 2
const VENUE_SPACING = 6 // space between venues in Z axis
// Pressure threshold: highlight any level whose quantity > 10% of total volume
const PRESSURE_THRESHOLD = 0.1


const VENUE_COLORS: Record<string, string> = {
  Binance: '#00c853',
  OKX: '#ff6d00',
  Bybit: '#00bcd4',
  Deribit: '#9c27b0',
}

interface BarsProps {
  side: 'bid' | 'ask'
}

export default function Bars({ side }: BarsProps) {
  const meshRefs = useRef<Record<string, THREE.InstancedMesh>>({})
  const prevYRefs = useRef<Record<string, number[]>>({})
  const { data, selectedVenues } = useOrderbookStore()

  // Flatten all prices for axis scale
  const allPrices = selectedVenues.flatMap(
    v => data[v]?.[side]?.map(l => l.price) ?? []
  )
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const midPrice = (minPrice + maxPrice) / 2
  const spread = maxPrice - minPrice || 1
  const PRICE_SCALE = 200 / spread

  // Flatten all quantities for Y scale
  const allQuantities = selectedVenues.flatMap(
    v => data[v]?.[side]?.map(l => l.quantity) ?? []
  )
  const maxQty = Math.max(...allQuantities, 1)

  useEffect(() => {
    selectedVenues.forEach((venue, vi) => {
      const inst = meshRefs.current[venue]
      const levels = data[venue]?.[side] || []
      const prevY = prevYRefs.current[venue] || []

      if (!inst) return

      // compute total volume for this side & venue
      const totalQty = levels.reduce((sum, l) => sum + l.quantity, 0) || 1

      // detect pressure zones for stats/alerts
      const pressureZones = levels
        .map(l => ({ price: l.price, ratio: l.quantity / totalQty }))
        .filter(z => z.ratio >= PRESSURE_THRESHOLD)

      if (pressureZones.length) {
        console.warn(
          `%c Pressure zones in ${venue} (${side}):`,
          'color: red; font-weight: bold;',
          pressureZones
        )
      }

      for (let i = 0; i < levels.length; i++) {
        const { price, quantity } = levels[i]
        const matrix = new THREE.Matrix4()

        // X position
        const x = (price - midPrice) * PRICE_SCALE

        // Y height smoothing
        const targetY = (quantity / maxQty) * 100
        const smoothY = THREE.MathUtils.lerp(prevY[i] || 0, targetY, 0.2)
        prevY[i] = smoothY

        // Z offset per venue
        const zOffset = vi * VENUE_SPACING
        const z = side === 'bid' ? -zOffset : zOffset

        // build transform
        matrix.makeTranslation(x, smoothY / 2, z)
        matrix.scale(new THREE.Vector3(BAR_WIDTH, smoothY, BAR_DEPTH))
        inst.setMatrixAt(i, matrix)

        // color gradient: low pressure = green, high = red
        const intensity = Math.min(quantity / totalQty, 1)
        const color = new THREE.Color()
        // HSL: from green (0.33) to red (0)
        color.setHSL(0.33 - intensity * 0.33, 1, 0.5)
        inst.setColorAt(i, color)
      }

      inst.count = levels.length
      inst.instanceMatrix.needsUpdate = true
      prevYRefs.current[venue] = prevY
    })
  }, [data, selectedVenues, side, midPrice, maxQty, PRICE_SCALE])

  const PriceLabels = () => {
    const ticks = 5
    const priceInterval = spread / (ticks - 1)

    return (
      <>
        {Array.from({ length: ticks }, (_, i) => {
          const price = minPrice + i * priceInterval
          const x = (price - midPrice) * PRICE_SCALE
          return (
            <Text
              key={i}
              position={[x, 0, side === 'ask' ? 60 : -60]}
              fontSize={2}
              color="white"
              anchorX="center"
              anchorY="top"
            >
              {price.toFixed(0)}
            </Text>
          )
        })}
      </>
    )
  }

  const QuantityLabels = () => {
    const ticks = 5
    return (
      <>
        {Array.from({ length: ticks }, (_, i) => {
          const y = (i / (ticks - 1)) * 100
          return (
            <Text
              key={i}
              position={[0, y, side === 'ask' ? 60 : -60]}
              fontSize={2}
              color="white"
              anchorX="right"
              anchorY="middle"
            >
              {(maxQty * i / (ticks - 1)).toFixed(0)}
            </Text>
          )
        })}
      </>
    )
  }

  return (
    <>
      {selectedVenues.map(venue => {
        const levels = data[venue]?.[side] || []
        return (
          <instancedMesh
            key={venue}
            ref={ref => { if (ref) meshRefs.current[venue] = ref }}
            args={[undefined, undefined, levels.length || 1]}
          >
            <boxGeometry />
            <meshStandardMaterial color={VENUE_COLORS[venue]} />
          </instancedMesh>
        )
      })}

      {/* Axis Labels (render once) */}
      {side === 'ask' && (
        <>
          <PriceLabels />
          <QuantityLabels />
        </>
      )}
    </>
  )
}
