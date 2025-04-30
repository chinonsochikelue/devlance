"use client"

import { useCallback } from "react"
import { Particles } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import { useTheme } from "next-themes"
import { Engine } from "@tsparticles/engine"

export function ParticlesBackground() {
  const { theme } = useTheme()
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <>
    <div className="absolute inset-0 -z-10">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background dark:to-background-dark opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background dark:from-background-dark to-transparent opacity-50" /> */}
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0 -z-10"
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        particles: {
          color: {
            value: theme === "dark" ? "#ffffff" : "#000000",
          },
          links: {
            color: theme === "dark" ? "#ffffff" : "#000000",
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.3,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
    />
    </div></>
  )
}