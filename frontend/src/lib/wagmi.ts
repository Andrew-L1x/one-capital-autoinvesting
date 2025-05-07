import { http } from 'viem'
import { createConfig } from 'wagmi'
import { l1xTestnet } from './networks'
import { injected } from 'wagmi/connectors'

declare global {
  interface Window {
    l1x?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      isL1X: boolean
      isConnected: () => boolean
      enable: () => Promise<string[]>
    }
  }
}

// L1X Wallet connector
const l1xConnector = injected({
  target: {
    id: 'l1x',
    name: 'L1X Wallet',
    provider: typeof window !== 'undefined' ? window.l1x : undefined,
    isL1X: true,
  },
  shimDisconnect: true,
})

// Create wagmi config
export const config = createConfig({
  chains: [l1xTestnet],
  connectors: [l1xConnector],
  transports: {
    [l1xTestnet.id]: http(l1xTestnet.rpcUrls.default.http[0]),
  },
}) 