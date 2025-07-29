'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import { useBinanceDepth } from '@/hooks/useBinanceDepth'
import { useOKXDepth }     from '@/hooks/useOKXDepth'
import { useBybitDepth }   from '@/hooks/useBybitDepth'
import { useDeribitDepth } from '@/hooks/useDeribitDepth'

import Bars from './Bars'
import ControlPanel from './ControlPanel'

interface OrderbookSceneProps {
  autoRotate: boolean
  setAutoRotate: React.Dispatch<React.SetStateAction<boolean>>
  rotationSpeed: number
  setRotationSpeed: React.Dispatch<React.SetStateAction<number>>
}

export default function OrderbookScene({
  autoRotate,
  setAutoRotate,
  rotationSpeed,
  setRotationSpeed,
}: OrderbookSceneProps) {

  // subscribe to all venues
  useBinanceDepth(); useOKXDepth()
  useBybitDepth();   useDeribitDepth()

  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <ControlPanel
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          rotationSpeed={rotationSpeed}
          setRotationSpeed={setRotationSpeed}
        />
      </div>

      <Canvas camera={{ position: [0, 30, 200], fov: 60 }}>
        <ambientLight intensity={0.5} />        
        <directionalLight position={[10, 20, 10]} />
        <pointLight position={[10, 30, 10]} intensity={1.2} />

        <Bars side="bid" />
        <Bars side="ask" />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate={autoRotate}
          autoRotateSpeed={rotationSpeed}
          
        />
      </Canvas>
    </>
  )
}
