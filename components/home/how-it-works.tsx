"use client"

import { motion } from "framer-motion"
import { Search, MessageSquare, Rocket } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Browse",
    description: "Search and filter through profiles of expert developers from around the world."
  },
  {
    icon: MessageSquare,
    title: "Connect",
    description: "Message developers directly to discuss your project requirements and timelines."
  },
  {
    icon: Rocket,
    title: "Build",
    description: "Collaborate effectively and bring your project vision to life with the right talent."
  }
]

export function HowItWorks() {
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Finding and connecting with developers has never been easier. Follow these simple steps.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={step.title}
              className="bg-card rounded-lg p-6 text-center border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}