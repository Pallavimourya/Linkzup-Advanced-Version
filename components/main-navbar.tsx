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

  const isHomePage = pathname === '/'
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`border-b sticky top-0 z-50 ${
      isHomePage 
        ? 'border-white/20 bg-transparent backdrop-blur-sm' 
        : 'border-gray-200 bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="4xl" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className={`transition-colors ${
                isActive('/features') 
                  ? (isHomePage ? 'text-white font-medium' : 'text-primary font-medium')
                  : (isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-primary')
              }`}
            >
              Features
            </Link>
            <Link 
              href="/plans" 
              className={`transition-colors ${
                isActive('/plans') 
                  ? (isHomePage ? 'text-white font-medium' : 'text-primary font-medium')
                  : (isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-primary')
              }`}
            >
              Plans
            </Link>
            <Link 
              href="/about" 
              className={`transition-colors ${
                isActive('/about') 
                  ? (isHomePage ? 'text-white font-medium' : 'text-primary font-medium')
                  : (isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-primary')
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`transition-colors ${
                isActive('/contact') 
                  ? (isHomePage ? 'text-white font-medium' : 'text-primary font-medium')
                  : (isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-primary')
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className={
                isHomePage 
                  ? "text-white hover:text-white hover:bg-white/10" 
                  : "text-gray-700 hover:text-primary hover:bg-primary/10"
              }>
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white">
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
              className={`p-2 ${
                isHomePage 
                  ? "text-white hover:text-white hover:bg-white/10" 
                  : "text-gray-700 hover:text-primary hover:bg-primary/10"
              }`}
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
          <div className={`md:hidden border-t ${
            isHomePage 
              ? 'border-white/20 bg-black/80 backdrop-blur-sm' 
              : 'border-gray-200 bg-white shadow-lg'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/features" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/features') 
                    ? (isHomePage ? 'text-white bg-white/20' : 'text-primary bg-primary/10')
                    : (isHomePage ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-primary hover:bg-primary/10')
                }`}
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link 
                href="/plans" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/plans') 
                    ? (isHomePage ? 'text-white bg-white/20' : 'text-primary bg-primary/10')
                    : (isHomePage ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-primary hover:bg-primary/10')
                }`}
                onClick={closeMobileMenu}
              >
                Plans
              </Link>
              <Link 
                href="/about" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/about') 
                    ? (isHomePage ? 'text-white bg-white/20' : 'text-primary bg-primary/10')
                    : (isHomePage ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-primary hover:bg-primary/10')
                }`}
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/contact') 
                    ? (isHomePage ? 'text-white bg-white/20' : 'text-primary bg-primary/10')
                    : (isHomePage ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-primary hover:bg-primary/10')
                }`}
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className={`pt-4 pb-3 border-t ${
                isHomePage ? 'border-white/20' : 'border-gray-200'
              }`}>
                <div className="space-y-2">
                  <Link href="/auth/signin" onClick={closeMobileMenu}>
                    <Button variant="ghost" className={`w-full justify-start ${
                      isHomePage 
                        ? 'text-white hover:text-white hover:bg-white/10' 
                        : 'text-gray-700 hover:text-primary hover:bg-primary/10'
                    }`}>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={closeMobileMenu}>
                    <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-white">
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