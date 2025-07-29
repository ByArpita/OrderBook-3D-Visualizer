'use client'

import OrderbookScene from '@/components/OrderbookScene'
import { useState } from 'react'

export default function Home() {
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(0.3)

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <OrderbookScene
        autoRotate={autoRotate}
        rotationSpeed={rotationSpeed}
        setAutoRotate={setAutoRotate}
        setRotationSpeed={setRotationSpeed}
      />
    </div>
  )
}
