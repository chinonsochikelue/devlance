'use client'

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, OrbitControls, Cloud } from '@react-three/drei'
import { motion } from 'framer-motion'
import { MeshStandardMaterial, SphereGeometry, PointLight, Vector3, DoubleSide, CanvasTexture } from 'three'
import { SignUp } from '@/components/SignUp'

// Function to generate the Aurora texture
function generateAuroraTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  // Create a simple gradient for aurora
  const gradient = context.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, 'rgba(0,255,0,0.5)')
  gradient.addColorStop(1, 'rgba(0,0,255,0.5)')

  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  return new CanvasTexture(canvas)
}

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* FULL SCREEN GALAXY + NEBULA */}
      <Canvas className="absolute inset-0" camera={{ position: [0, 0, 10], fov: 75 }}>
        <Suspense fallback={null}>
          {/* Star field */}
          <Stars
            radius={200}
            depth={60}
            count={8000}
            factor={4}
            saturation={0}
            fade
            speed={2}
          />

          {/* Nebula Clouds */}
          <Cloud position={[0, 0, -10]} scale={[10, 5, 5]} color="purple" opacity={0.5} args={[5, 5, 5]}>
            <meshStandardMaterial color="purple" opacity={0.5} transparent />
          </Cloud>
          <Cloud position={[-5, -3, -8]} scale={[8, 5, 5]} color="cyan" opacity={0.4} args={[5, 5, 5]}>
            <meshStandardMaterial color="cyan" opacity={0.4} transparent />
          </Cloud>
          <Cloud position={[5, 3, -12]} scale={[6, 4, 5]} color="pink" opacity={0.3} args={[5, 5, 5]}>
            <meshStandardMaterial color="pink" opacity={0.3} transparent />
          </Cloud>

          {/* Aurora Lights */}
          <Aurora />

          {/* Comet with Tail */}
          <Comet />

          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
        </Suspense>
      </Canvas>

      {/* Center Form */}
      <motion.div
        style={{ position: 'absolute', zIndex: 1000 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        initial={{ opacity: 0, scale: 0.8 }}
        className="absolute inset-0 flex items-center justify-center">
        <SignUp />
      </motion.div>
    </div>
  )
}

// ---------------------------
// Aurora Lights Component
const Aurora = () => {
  const ref = useRef()
  const texture = useMemo(() => generateAuroraTexture(), [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.4 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <mesh ref={ref} position={[0, 5, -20]}>
      <planeGeometry args={[15, 5]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={DoubleSide}
      />
    </mesh>
  )
}

// ---------------------------
// Comet Component
const Comet = () => {
  const cometRef = useRef()

  useEffect(() => {
    let cometPosition = new Vector3(-15, 5, -10)
    const moveComet = () => {
      cometPosition.x += 0.1
      cometPosition.y -= 0.05
      cometPosition.z += 0.05

      if (cometRef.current) {
        cometRef.current.position.set(cometPosition.x, cometPosition.y, cometPosition.z)
      }

      if (cometPosition.x > 20) {
        cometPosition.set(-15, 5, -10) // Reset position when out of bounds
      }
    }

    const interval = setInterval(moveComet, 16)

    return () => clearInterval(interval)
  }, [])

  return (
    <group>
      {/* Comet's head */}
      <mesh ref={cometRef} position={[-15, 5, -10]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="white" emissive="white" />
      </mesh>
      {/* Comet's tail */}
      <mesh position={[-14.5, 5, -10]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="lightblue" opacity={0.8} transparent />
      </mesh>
    </group>
  )
}
