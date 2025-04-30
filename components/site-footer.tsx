'use client';
import { Logo } from "@/components/logo"
import { Github, Twitter, Linkedin, Instagram } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion" // 👈 install this if you haven't: npm install framer-motion

export function SiteFooter() {
  return (
    <footer className="border-t">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container py-12 md:py-16"
      >
          {/* Logo Section */}
          <div className="space-y-4 text-center mb-20 items-center justify-self-center"> 
            <h2 className="text-4xl md:text-4xl font-bold mb-4">{'</>'} Devlance</h2>
            <p className="text-sm text-muted-foreground">
              Connecting the world's best developers with innovative projects
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        {/* Grid */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-10 w-full text-center justify-items-center">

          {/* Separator */}
          <div className="hidden md:block h-full w-px bg-muted absolute top-0 left-1/4 transform -translate-x-1/2" />

          {/* For Developers */}
          <div className="space-y-4 relative">
            <h3 className="font-semibold text-foreground">For Developers</h3>
            <ul className="space-y-2">
              {["Find Work", "Create Profile", "Developer Blog", "Learning Resources"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Separator */}
          <div className="hidden md:block h-full w-px bg-muted absolute top-0 left-2/4 transform -translate-x-1/2" />

          {/* For Clients */}
          <div className="space-y-4 relative">
            <h3 className="font-semibold text-foreground">For Clients</h3>
            <ul className="space-y-2">
              {["Post a Job", "Browse Developers", "Success Stories", "Enterprise Solutions"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Separator */}
          <div className="hidden md:block h-full w-px bg-muted absolute top-0 left-3/4 transform -translate-x-1/2" />

          {/* Company */}
          <div className="space-y-4 relative">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              {["About Us", "Careers", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


{/* Separator */}
          <div className="hidden md:block h-full w-px bg-muted absolute top-0 left-3/4 transform -translate-x-1/2" />

          {/* Company */}
          <div className="space-y-4 relative">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              {["About Us", "Careers", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Devlance. All rights reserved.
        </div>
      </motion.div>
    </footer>
  )
}
