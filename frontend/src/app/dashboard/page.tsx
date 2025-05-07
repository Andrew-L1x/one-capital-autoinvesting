'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, Plus, Minus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssetAllocationBuilder } from '@/components/AssetAllocationBuilder'
import { useAssetStore } from '@/lib/store'
import { getTokenPrices, subscribeToTokenPrices, type PriceData } from '@/lib/price-feed'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57']

export default function DashboardPage() {
  const [isAutoRebalance, setIsAutoRebalance] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const { assets, setAssets } = useAssetStore()
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  useEffect(() => {
    const symbols = assets.map(asset => asset.symbol)
    let cleanup: (() => void) | undefined

    const initPrices = async () => {
      try {
        setIsLoading(true)
        cleanup = await subscribeToTokenPrices(symbols, setPrices)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize price feed:', error)
        setIsLoading(false)
      }
    }

    initPrices()

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [assets])

  if (!isConnected) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Connect Your Wallet</h2>
          <p className="mb-8 text-muted-foreground">
            Please connect your wallet to view your portfolio
          </p>
          <Button onClick={() => setIsConnected(true)}>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  // Calculate total portfolio value and 24h change
  const totalValue = assets.reduce((sum, asset) => {
    const price = prices[asset.symbol]?.current_price || 0
    return sum + (price * (asset.amount || 0))
  }, 0)

  const totalChange24h = assets.reduce((sum, asset) => {
    const price = prices[asset.symbol]
    if (!price) return sum
    const value = (asset.amount || 0) * price.current_price
    return sum + (value * (price.price_change_percentage_24h / 100))
  }, 0)

  const change24hPercentage = (totalChange24h / (totalValue - totalChange24h)) * 100

  return (
    <div className="container space-y-8 py-8">
      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Value
            </h3>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              24h Change
            </h3>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold">
              ${Math.abs(totalChange24h).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span
              className={`flex items-center text-sm ${
                change24hPercentage >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change24hPercentage >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(change24hPercentage).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Deposit and Asset Allocation Side by Side */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Deposit Widget */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium mb-4">Deposit</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="depositAmount" className="block text-sm font-medium text-muted-foreground mb-1">
                Deposit Amount ($)
              </label>
              <input
                id="depositAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={depositAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  setDepositAmount(value);
                  const amount = parseFloat(value) || 0;
                  const newAssets = assets.map(asset => {
                    const price = prices[asset.symbol]?.current_price || 0;
                    const allocationAmount = (amount * asset.allocation) / 100;
                    const quantity = price > 0 ? allocationAmount / price : 0;
                    return { ...asset, amount: quantity };
                  });
                  setAssets(newAssets);
                }}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Estimated Purchase</h4>
              <ul className="space-y-2">
                {assets.map((asset) => {
                  const price = prices[asset.symbol]?.current_price || 0;
                  const allocationAmount = (parseFloat(depositAmount) * asset.allocation) / 100;
                  const quantity = price > 0 ? allocationAmount / price : 0;
                  return (
                    <li key={asset.symbol} className="flex justify-between text-sm">
                      <span>{asset.symbol}</span>
                      <span>{quantity.toFixed(6)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Asset Allocation Builder */}
        <AssetAllocationBuilder />
      </div>

      {/* Asset Allocation Pie Chart */}
      <div className="rounded-lg border bg-card p-6 flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="w-full md:w-1/2 flex justify-center">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={assets}
                dataKey="allocation"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {assets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
          <ul className="space-y-2">
            {assets.map((asset, index) => (
              <li key={asset.symbol} className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="font-medium">{asset.symbol}</span>
                <span className="ml-auto">{asset.allocation}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Token List */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h3 className="text-lg font-medium">Token List</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-4 font-medium">Token</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Value</th>
                  <th className="pb-4 font-medium">24h Change</th>
                  <th className="pb-4 font-medium">Allocation</th>
                  <th className="pb-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((token) => {
                  const price = prices[token.symbol]
                  const value = price ? (token.amount || 0) * price.current_price : 0
                  const change24h = price?.price_change_percentage_24h || 0

                  return (
                    <tr key={token.symbol} className="border-b">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{token.symbol}</span>
                          <span className="text-sm text-muted-foreground">
                            {token.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">{token.amount || '-'}</td>
                      <td className="py-4">
                        ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4">
                        <span
                          className={`flex items-center ${
                            change24h >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {change24h >= 0 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          {Math.abs(change24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4">{token.allocation}%</td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 