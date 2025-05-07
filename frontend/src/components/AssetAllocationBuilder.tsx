'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import { useAssetStore, Asset } from '@/lib/store'

const availableAssets = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'L1X', name: 'L1X Token' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'MATIC', name: 'Polygon' },
]

export function AssetAllocationBuilder() {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const { assets, setAssets, updateAssetAllocation } = useAssetStore()

  const redistributeAllocations = (newAssets: Asset[]) => {
    const totalAssets = newAssets.length
    const baseAllocation = Math.floor(100 / totalAssets)
    const remainder = 100 % totalAssets

    return newAssets.map((asset, index) => ({
      ...asset,
      allocation: index === 0 ? baseAllocation + remainder : baseAllocation,
    }))
  }

  const handleAllocationChange = (index: number, value: number) => {
    const newAssets = [...assets]
    const oldValue = newAssets[index].allocation
    const difference = value - oldValue

    // Calculate remaining allocation
    const remainingAllocation = 100 - value
    const remainingAssets = newAssets.filter((_, i) => i !== index)
    const totalRemainingAllocation = remainingAssets.reduce(
      (sum, asset) => sum + asset.allocation,
      0
    )

    // Redistribute remaining allocation proportionally
    if (remainingAssets.length > 0) {
      remainingAssets.forEach((asset, i) => {
        const proportion = asset.allocation / totalRemainingAllocation
        const newAllocation = Math.round(remainingAllocation * proportion)
        newAssets[newAssets.findIndex(a => a.symbol === asset.symbol)].allocation = newAllocation
      })
    }

    newAssets[index].allocation = value
    setAssets(newAssets)
  }

  const handleAssetChange = (index: number, symbol: string) => {
    const newAsset = availableAssets.find(asset => asset.symbol === symbol)
    if (newAsset) {
      const newAssets = [...assets]
      newAssets[index] = { ...newAsset, allocation: assets[index].allocation }
      setAssets(redistributeAllocations(newAssets))
    }
    setOpenDropdown(null)
  }

  const addAsset = () => {
    const availableAsset = availableAssets.find(
      asset => !assets.some(a => a.symbol === asset.symbol)
    )
    if (availableAsset) {
      const newAssets = [...assets, { ...availableAsset, allocation: 0 }]
      setAssets(redistributeAllocations(newAssets))
    }
  }

  const removeAsset = (index: number) => {
    const newAssets = assets.filter((_, i) => i !== index)
    setAssets(redistributeAllocations(newAssets))
  }

  const totalAllocation = assets.reduce((sum, asset) => sum + asset.allocation, 0)

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Asset Allocation</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          {isOpen ? 'Hide' : 'Show'} Details
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </div>

      <div className="space-y-4">
        {assets.map((asset, index) => (
          <div key={asset.symbol} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                  className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <span>{asset.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {openDropdown === index && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
                    {availableAssets
                      .filter(a => !assets.some(existing => existing.symbol === a.symbol) || a.symbol === asset.symbol)
                      .map(availableAsset => (
                        <button
                          key={availableAsset.symbol}
                          onClick={() => handleAssetChange(index, availableAsset.symbol)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          {availableAsset.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={asset.allocation}
                  onChange={(e) =>
                    handleAllocationChange(index, parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={asset.allocation}
                  onChange={(e) =>
                    handleAllocationChange(index, parseInt(e.target.value) || 0)
                  }
                  className="w-20 rounded-md border bg-background px-2 py-1 text-right text-sm"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeAsset(index)}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {assets.length < availableAssets.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={addAsset}
            className="mt-4 w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        )}

        {isOpen && (
          <div className="mt-4 rounded-md bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Allocation</span>
              <span
                className={`text-sm font-medium ${
                  totalAllocation === 100
                    ? 'text-green-500'
                    : totalAllocation > 100
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`}
              >
                {totalAllocation}%
              </span>
            </div>
            {totalAllocation !== 100 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {totalAllocation < 100
                  ? `Add ${100 - totalAllocation}% more allocation`
                  : `Remove ${totalAllocation - 100}% allocation`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 