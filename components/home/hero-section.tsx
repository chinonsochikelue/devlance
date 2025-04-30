"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SearchIcon, SparklesIcon } from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TechBadges } from "@/components/tech-badges"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTech, setActiveTech] = useState<string | undefined>()
  
  const popularTechs = [
    "React", "Node.js", "TypeScript", "Python", 
    "Flutter", "AWS", "Golang", "Rust"
  ]

  return (
    <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
      <ParticlesBackground />
      
      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Connect with the best developers worldwide.
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find expert developers for your projects or showcase your skills to get hired.
            Our platform brings together top talent and innovative companies.
          </motion.p>
          
          <motion.div 
            className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search for developers by skill, location, or name..." 
                  className="pl-10 pr-4 py-6 rounded-l-md rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="rounded-l-none rounded-r-md h-12 px-6">
                Search
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-sm mb-3 text-muted-foreground">Popular technologies</p>
            <TechBadges 
              techs={popularTechs} 
              className="justify-center" 
              onClick={(tech) => setActiveTech(activeTech === tech ? undefined : tech)}
              active={activeTech}
            />
          </motion.div>
        </div>
        
        <motion.div 
          className="bg-secondary/50 border border-border backdrop-blur-sm rounded-xl p-4 md:p-6 max-w-3xl mx-auto flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <SparklesIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium mb-1">Not sure who to hire?</h3>
            <p className="text-sm text-muted-foreground">Let Gemini AI match you with the best developers for your project.</p>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm">Try AI Match</Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}