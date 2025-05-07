'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockTokens, mockTransactions } from '@/lib/mockData'

export default function PortfolioPage() {
  const [isConnected, setIsConnected] = useState(true) // Mock connected state

  if (!isConnected) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-4">Please connect your L1X wallet to view your portfolio</p>
          <Button onClick={() => setIsConnected(true)}>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  const totalValue = mockTokens.reduce((sum, token) => sum + token.value, 0)
  const totalChange24h = mockTokens.reduce((sum, token) => sum + token.change24h, 0) / mockTokens.length

  return (
    <div className="space-y-6 p-6">
      {/* Portfolio Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium">Total Value</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            <div className={`flex items-center text-sm ${totalChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalChange24h >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{Math.abs(totalChange24h).toFixed(2)}%</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium">Total Tokens</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold">{mockTokens.length}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium">Last Update</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold">Now</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium">Actions</h3>
          <div className="mt-2">
            <Button className="w-full">Rebalance Portfolio</Button>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Your Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Token</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-right py-3 px-4">Value</th>
                  <th className="text-right py-3 px-4">24h Change</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockTokens.map((token) => (
                  <tr key={token.symbol} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-muted-foreground ml-2">{token.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{token.amount}</td>
                    <td className="text-right py-3 px-4">${token.value.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <div className={`flex items-center justify-end ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change24h >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(token.change24h)}%
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <Button variant="outline" size="sm">
                        Trade
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Token</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-right py-3 px-4">Value</th>
                  <th className="text-right py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.type === 'buy' ? 'Buy' : 'Sell'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{tx.symbol}</td>
                    <td className="text-right py-3 px-4">{tx.amount}</td>
                    <td className="text-right py-3 px-4">${tx.value.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 