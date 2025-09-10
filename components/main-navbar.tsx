"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu, X } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function MainNavbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="lg" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className={`transition-colors ${
                isActive('/features') 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Features
            </Link>
            <Link 
              href="/plans" 
              className={`transition-colors ${
                isActive('/plans') 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Plans
            </Link>
            <Link 
              href="/about" 
              className={`transition-colors ${
                isActive('/about') 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`transition-colors ${
                isActive('/contact') 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/features" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/features') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link 
                href="/plans" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/plans') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                onClick={closeMobileMenu}
              >
                Plans
              </Link>
              <Link 
                href="/about" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/about') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 pb-3 border-t border-border">
                <div className="space-y-2">
                  <Link href="/auth/signin" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={closeMobileMenu}>
                    <Button className="w-full justify-start">
                      Get Started <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
