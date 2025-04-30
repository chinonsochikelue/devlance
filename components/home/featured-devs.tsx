"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { TechBadges } from "@/components/tech-badges"
import { Button } from "@/components/ui/button"

// Sample developer data
const developers = [
  {
    id: 1,
    name: "Jessica Chen",
    role: "Full Stack Developer",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    location: "San Francisco, USA",
    rating: 4.9,
    available: true,
    techs: ["React", "Node.js", "TypeScript", "AWS"]
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Mobile Developer",
    avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    location: "Berlin, Germany",
    rating: 4.8,
    available: true,
    techs: ["Flutter", "Swift", "Kotlin", "Firebase"]
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "UI/UX Designer & Developer",
    avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    location: "Bangalore, India",
    rating: 5.0,
    available: false,
    techs: ["Figma", "React", "TailwindCSS", "Framer"]
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Backend Developer",
    avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    location: "Toronto, Canada",
    rating: 4.7,
    available: true,
    techs: ["Python", "Django", "PostgreSQL", "Docker"]
  }
]

export function FeaturedDevs() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  
  return (
    <section className="py-20">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Developers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet some of our top-rated developers ready to help with your next project.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {developers.map((dev) => (
            <motion.div 
              key={dev.id}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              onHoverStart={() => setHoveredId(dev.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <div className="relative h-48">
                <Image 
                  src={dev.avatar} 
                  alt={dev.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium text-sm">{dev.rating}</span>
                </div>
                {dev.available ? (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Available
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Unavailable
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-1">{dev.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{dev.role}</p>
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{dev.location}</span>
                </div>
                
                <TechBadges techs={dev.techs} limit={3} />
                
                <div className="mt-5">
                  <Button variant="outline" className="w-full">View Profile</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">View All Developers</Button>
        </div>
      </div>
    </section>
  )
}