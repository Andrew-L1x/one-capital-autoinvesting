'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Wallet, Settings } from 'lucide-react'
import { WalletConnectButton } from './WalletConnectButton'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { href: '/portfolio', label: 'Portfolio', icon: Wallet },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">One Capital</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="flex h-16 items-center border-b px-6">
          <div className="ml-auto">
            <WalletConnectButton />
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
} 