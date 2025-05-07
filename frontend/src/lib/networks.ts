import { Chain } from 'viem'

export const l1xTestnet: Chain = {
  id: 1515,
  name: 'L1X Testnet',
  network: 'l1x-testnet',
  nativeCurrency: {
    name: 'L1X',
    symbol: 'L1X',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.l1x.foundation'],
    },
    public: {
      http: ['https://testnet-rpc.l1x.foundation'],
    },
  },
  blockExplorers: {
    default: {
      name: 'L1X Explorer',
      url: 'https://testnet-explorer.l1x.foundation',
    },
  },
  testnet: true,
} 