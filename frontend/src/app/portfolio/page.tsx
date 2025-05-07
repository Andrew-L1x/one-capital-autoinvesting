'use client'

import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout'

const holdings = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: '1.5',
    value: 75000,
    change24h: 2.5,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    amount: '25',
    value: 45000,
    change24h: -1.2,
  },
  {
    symbol: 'L1X',
    name: 'L1X',
    amount: '5000',
    value: 5000,
    change24h: 5.8,
  },
]

const transactions = [
  {
    type: 'Buy',
    symbol: 'BTC',
    amount: '0.5',
    value: 25000,
    date: '2024-03-15',
  },
  {
    type: 'Sell',
    symbol: 'ETH',
    amount: '10',
    value: 18000,
    date: '2024-03-14',
  },
  {
    type: 'Buy',
    symbol: 'L1X',
    amount: '2000',
    value: 2000,
    date: '2024-03-13',
  },
]

export default function PortfolioPage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
            <p className="mt-2 text-3xl font-bold">$125,000.00</p>
            <div className="mt-2 flex items-center text-sm text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +2.5% ($3,125.00)
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">24h Change</h3>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-3xl font-bold text-green-500">+2.5%</p>
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">$3,125.00</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Tokens</h3>
            <p className="mt-2 text-3xl font-bold">3</p>
            <p className="mt-2 text-sm text-muted-foreground">Across all chains</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Last Update</h3>
            <p className="mt-2 text-3xl font-bold">2m ago</p>
            <Button variant="outline" size="sm" className="mt-2">
              Refresh
            </Button>
          </div>
        </div>

        {/* Holdings */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Holdings</h2>
            <Button variant="outline" size="sm">
              Add Token
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Token</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Value</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{holding.symbol}</span>
                        <span className="text-sm text-muted-foreground">{holding.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{holding.amount}</td>
                    <td className="text-right py-3 px-4">${holding.value.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <div className={`flex items-center justify-end gap-1 ${
                        holding.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {holding.change24h >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {Math.abs(holding.change24h)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Token</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Value</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'Buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{tx.symbol}</td>
                    <td className="text-right py-3 px-4">{tx.amount}</td>
                    <td className="text-right py-3 px-4">${tx.value.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-sm text-muted-foreground">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
} 