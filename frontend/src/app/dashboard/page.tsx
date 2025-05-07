'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout'
import { useState } from 'react'

const defaultTokens = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'L1X', name: 'L1X' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'BNB', name: 'BNB Chain' },
  { symbol: 'ARB', name: 'Arbitrum' },
  { symbol: 'OP', name: 'Optimism' },
  { symbol: 'USDC', name: 'USD Coin' },
]

const performanceData = [
  { date: 'Jan', value: 100000 },
  { date: 'Feb', value: 105000 },
  { date: 'Mar', value: 110000 },
  { date: 'Apr', value: 108000 },
  { date: 'May', value: 115000 },
  { date: 'Jun', value: 125000 },
]

export default function DashboardPage() {
  const [tokens, setTokens] = useState([
    { symbol: 'BTC', allocation: 40, color: '#F7931A' },
    { symbol: 'ETH', allocation: 30, color: '#627EEA' },
    { symbol: 'L1X', allocation: 30, color: '#1D3F9D' },
  ])

  const handleAddToken = () => {
    if (tokens.length >= defaultTokens.length) return // Prevent adding more tokens than available

    // Find the token with the highest allocation
    const highestAllocationToken = tokens.reduce((prev, current) => 
      (prev.allocation > current.allocation) ? prev : current
    )
    
    // Calculate the new allocation (take 10% from the highest allocation)
    const reductionAmount = 10
    const newTokens = tokens.map(token => {
      if (token.symbol === highestAllocationToken.symbol) {
        return {
          ...token,
          allocation: token.allocation - reductionAmount
        }
      }
      return token
    })

    // Add the new token with the taken percentage
    setTokens([
      ...newTokens,
      { symbol: 'BTC', allocation: reductionAmount, color: '#F7931A' }
    ])
  }

  const handleRemoveToken = (index: number) => {
    setTokens(tokens.filter((_, i) => i !== index))
  }

  const handleTokenChange = (index: number, symbol: string) => {
    const newTokens = [...tokens]
    const token = defaultTokens.find(t => t.symbol === symbol)
    if (token) {
      newTokens[index] = {
        ...newTokens[index],
        symbol: token.symbol,
        color: token.symbol === 'BTC' ? '#F7931A' : 
               token.symbol === 'ETH' ? '#627EEA' : 
               token.symbol === 'L1X' ? '#1D3F9D' :
               '#' + Math.floor(Math.random()*16777215).toString(16)
      }
      setTokens(newTokens)
    }
  }

  const handleAllocationChange = (index: number, value: string) => {
    const newTokens = [...tokens]
    newTokens[index] = {
      ...newTokens[index],
      allocation: parseInt(value) || 0
    }
    setTokens(newTokens)
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Portfolio Value</h3>
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
            <h3 className="text-sm font-medium text-muted-foreground">Auto-Rebalance</h3>
            <div className="mt-2 flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Last Rebalance</h3>
            <p className="mt-2 text-3xl font-bold">2 days ago</p>
            <Button variant="outline" size="sm" className="mt-2">
              Rebalance Now
            </Button>
          </div>
        </div>

        {/* Asset Allocation and Distribution */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Allocation Builder */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Asset Allocation</h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleAddToken}
              >
                <Plus className="h-4 w-4" />
                Add Token
              </Button>
            </div>
            <div className="space-y-4">
              {tokens.map((token, index) => (
                <div key={index} className="flex items-center gap-4">
                  <select 
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={token.symbol}
                    onChange={(e) => handleTokenChange(index, e.target.value)}
                  >
                    {defaultTokens.map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.name} ({t.symbol})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={token.allocation}
                    onChange={(e) => handleAllocationChange(index, e.target.value)}
                    className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="%"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => handleRemoveToken(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Portfolio Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokens}
                    dataKey="allocation"
                    nameKey="symbol"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ symbol, allocation }) => `${symbol} ${allocation}%`}
                  >
                    {tokens.map((token) => (
                      <Cell key={token.symbol} fill={token.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Graph */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Portfolio Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1D3F9D"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  )
} 