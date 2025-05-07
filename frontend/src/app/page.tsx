import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          One Capital
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Automated Investing. Native Tokens. Total Control.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Link href="/dashboard" className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Dashboard</h2>
            <p className="text-gray-600 mb-4">View your portfolio performance and manage your investments</p>
            <div className="flex items-center text-blue-600 group-hover:translate-x-2 transition-transform">
              <span>Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>

          <Link href="/portfolio" className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Portfolio</h2>
            <p className="text-gray-600 mb-4">Track your assets and view detailed analytics</p>
            <div className="flex items-center text-blue-600 group-hover:translate-x-2 transition-transform">
              <span>View Portfolio</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>

          <Link href="/settings" className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Settings</h2>
            <p className="text-gray-600 mb-4">Configure your preferences and manage your account</p>
            <div className="flex items-center text-blue-600 group-hover:translate-x-2 transition-transform">
              <span>Manage Settings</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </div>

        <div className="flex justify-center space-x-4">
          <Link 
            href="/dashboard" 
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/portfolio" 
            className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Portfolio
          </Link>
        </div>
      </div>
    </main>
  )
} 