import { create } from 'zustand'

export interface Asset {
  symbol: string
  name: string
  allocation: number
  amount: number
}

interface AssetStore {
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  updateAssetAllocation: (symbol: string, allocation: number) => void
}

export const useAssetStore = create<AssetStore>((set) => ({
  assets: [
    { symbol: 'BTC', name: 'Bitcoin', allocation: 40, amount: 0 },
    { symbol: 'ETH', name: 'Ethereum', allocation: 30, amount: 0 },
    { symbol: 'L1X', name: 'L1X Token', allocation: 20, amount: 0 },
    { symbol: 'USDC', name: 'USD Coin', allocation: 10, amount: 0 }
  ],
  setAssets: (assets) => set({ assets }),
  updateAssetAllocation: (symbol, allocation) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.symbol === symbol ? { ...asset, allocation } : asset
      ),
    })),
})) 