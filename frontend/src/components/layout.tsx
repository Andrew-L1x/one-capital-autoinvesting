'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  PieChart, 
  Mail, 
  Menu, 
  X,
  Twitter,
  Github,
  Linkedin,
  Facebook
} from 'lucide-react'
import { Button } from './ui/button'
import { WalletConnectButton } from './WalletConnectButton'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: PieChart
  },
  {
    name: 'Contact Us',
    href: '/contact',
    icon: Mail
  }
]

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/onecapital',
    icon: Twitter
  },
  {
    name: 'GitHub',
    href: 'https://github.com/onecapital',
    icon: Github
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/onecapital',
    icon: Linkedin
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/onecapital',
    icon: Facebook
  }
]

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.svg"
                alt="One Capital"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold">One Capital</span>
            </Link>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 mt-16 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <nav className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="mb-2 px-3 text-sm font-medium text-muted-foreground">
                  Connect with us
                </h3>
                <div className="flex gap-2 px-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                    >
                      <link.icon className="h-4 w-4" />
                      <span className="sr-only">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-200 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  )
} 