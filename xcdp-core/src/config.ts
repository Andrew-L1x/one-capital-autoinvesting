export const config = {
  network: 'l1x-testnet',
  rpcUrl: 'https://testnet-rpc.l1x.foundation',
  privateKey: process.env.DEPLOYER_PRIVATE_KEY || '',
  l1xBridge: process.env.L1X_BRIDGE_ADDRESS || '',
  dexRouter: process.env.DEX_ROUTER_ADDRESS || '',
  initialAssets: [
    '0x...', // BTC address
    '0x...', // ETH address
    '0x...', // L1X address
    '0x...', // USDC address
  ],
  initialWeights: [40, 30, 20, 10], // Percentages
}; 