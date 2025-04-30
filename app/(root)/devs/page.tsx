"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TechBadges } from "@/components/tech-badges"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"

// Sample developer data
const developers = [
  {
    id: 1,
    name: "Jessica Chen",
    role: "Full Stack Developer",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    location: "San Francisco, USA",
    rating: 4.9,
    hourlyRate: 85,
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
    hourlyRate: 75,
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
    hourlyRate: 60,
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
    hourlyRate: 80,
    available: true,
    techs: ["Python", "Django", "PostgreSQL", "Docker"]
  },
  {
    id: 5,
    name: "Ana Rodriguez",
    role: "DevOps Engineer",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    location: "Madrid, Spain",
    rating: 4.8,
    hourlyRate: 90,
    available: true,
    techs: ["AWS", "Kubernetes", "Terraform", "CI/CD"]
  },
  {
    id: 6,
    name: "Michael Kim",
    role: "Machine Learning Engineer",
    avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    location: "Seoul, South Korea",
    rating: 4.9,
    hourlyRate: 95,
    available: false,
    techs: ["Python", "TensorFlow", "PyTorch", "MLOps"]
  }
]

// Available technologies for filtering
const allTechnologies = [
  "React", "Node.js", "TypeScript", "JavaScript", 
  "Python", "Django", "Flask", "PostgreSQL", 
  "MongoDB", "AWS", "GCP", "Azure", 
  "Docker", "Kubernetes", "CI/CD", "Flutter", 
  "Swift", "Kotlin", "Firebase", "Figma", 
  "TailwindCSS", "Framer", "TensorFlow", "PyTorch"
]

// Locations for filtering
const locations = [
  "San Francisco, USA", 
  "New York, USA", 
  "London, UK", 
  "Berlin, Germany", 
  "Toronto, Canada", 
  "Bangalore, India", 
  "Sydney, Australia",
  "Tokyo, Japan",
  "Madrid, Spain",
  "Seoul, South Korea"
]

export default function DevsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([20, 150])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState("rating")
  
  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter(t => t !== tech))
    } else {
      setSelectedTechs([...selectedTechs, tech])
    }
  }
  
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location))
    } else {
      setSelectedLocations([...selectedLocations, location])
    }
  }
  
  // Filter and sort developers
  const filteredDevelopers = developers
    .filter(dev => {
      // Filter by search query
      if (searchQuery && !dev.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !dev.role.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Filter by selected techs
      if (selectedTechs.length > 0 && !selectedTechs.some(tech => dev.techs.includes(tech))) {
        return false
      }
      
      // Filter by location
      if (selectedLocations.length > 0 && !selectedLocations.includes(dev.location)) {
        return false
      }
      
      // Filter by price range
      if (dev.hourlyRate < priceRange[0] || dev.hourlyRate > priceRange[1]) {
        return false
      }
      
      // Filter by availability
      if (availableOnly && !dev.available) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating
      } else if (sortBy === "price_asc") {
        return a.hourlyRate - b.hourlyRate
      } else if (sortBy === "price_desc") {
        return b.hourlyRate - a.hourlyRate
      }
      return 0
    })
  
  return (
    <>
    <SiteHeader />
    <div className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse Developers</h1>
          <p className="text-muted-foreground max-w-3xl">
            Find the perfect developer for your project. Use the filters to narrow down your search.
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:w-72 shrink-0"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filters</h3>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Skills filter */}
                <Accordion type="single" collapsible defaultValue="skills">
                  <AccordionItem value="skills">
                    <AccordionTrigger className="text-sm font-medium">
                      Skills & Technologies
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-1 space-y-2">
                        <Input 
                          placeholder="Search technologies..." 
                          size={1}
                          className="mb-2"
                        />
                        <div className="h-48 overflow-y-auto space-y-1">
                          {allTechnologies.map(tech => (
                            <div key={tech} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`tech-${tech}`} 
                                checked={selectedTechs.includes(tech)}
                                onCheckedChange={() => toggleTech(tech)}
                              />
                              <label 
                                htmlFor={`tech-${tech}`}
                                className="text-sm cursor-pointer"
                              >
                                {tech}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Hourly rate filter */}
                <Accordion type="single" collapsible defaultValue="rate">
                  <AccordionItem value="rate">
                    <AccordionTrigger className="text-sm font-medium">
                      Hourly Rate
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 pb-2">
                        <Slider 
                          defaultValue={[20, 150]} 
                          min={10} 
                          max={200} 
                          step={5} 
                          value={priceRange}
                          onValueChange={setPriceRange}
                        />
                        <div className="flex justify-between mt-2 text-sm">
                          <span>${priceRange[0]}/hr</span>
                          <span>${priceRange[1]}/hr</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Location filter */}
                <Accordion type="single" collapsible defaultValue="location">
                  <AccordionItem value="location">
                    <AccordionTrigger className="text-sm font-medium">
                      Location
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-1 space-y-2">
                        <Input 
                          placeholder="Search locations..." 
                          size={1}
                          className="mb-2"
                        />
                        <div className="h-48 overflow-y-auto space-y-1">
                          {locations.map(location => (
                            <div key={location} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`location-${location}`} 
                                checked={selectedLocations.includes(location)}
                                onCheckedChange={() => toggleLocation(location)}
                              />
                              <label 
                                htmlFor={`location-${location}`}
                                className="text-sm cursor-pointer"
                              >
                                {location}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Availability filter */}
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox 
                    id="available" 
                    checked={availableOnly}
                    onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                  />
                  <label 
                    htmlFor="available"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Available developers only
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Main content */}
          <div className="flex-grow">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 items-center mb-6"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search by name, role or skills..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-sm whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredDevelopers.length > 0 ? (
                filteredDevelopers.map((dev, index) => (
                  <motion.div 
                    key={dev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader className="p-0">
                        <div className="relative h-48">
                          <Image 
                            src={dev.avatar} 
                            alt={dev.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg"></div>
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
                      </CardHeader>
                      <CardContent className="p-5 flex-grow">
                        <h3 className="text-lg font-semibold mb-1">{dev.name}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{dev.role}</p>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1 shrink-0" />
                          <span>{dev.location}</span>
                        </div>
                        
                        <div className="text-sm font-medium mb-4">
                          ${dev.hourlyRate}/hr
                        </div>
                        
                        <TechBadges techs={dev.techs} limit={3} />
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full">View Profile</Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full p-10 text-center">
                  <h3 className="text-lg font-medium mb-2">No developers found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to find developers matching your criteria.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}