import { http } from 'viem'
import { createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// L1X Wallet connector
const l1xWallet = injected({
  target: {
    id: 'l1x',
    name: 'L1X Wallet',
    provider: typeof window !== 'undefined' ? window.l1x : undefined,
  },
  shimDisconnect: true,
})

export const config = createConfig({
  chains: [mainnet],
  connectors: [
    l1xWallet,
  ],
  transports: {
    [mainnet.id]: http(),
  },
}) 