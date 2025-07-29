import { Level } from '@/store/orderbook'

/**
 * Return price levels where cumulative quantity > threshold.
 */
export function detectPressureZones(
  levels: Level[],
  threshold: number
): Level[] {
  const zones: Level[] = []
  let cumulative = 0
  for (const lvl of levels) {
    cumulative += lvl.quantity
    if (cumulative >= threshold) {
      zones.push(lvl)
      cumulative = 0 // reset if you want disjoint zones
    }
  }
  return zones
}
