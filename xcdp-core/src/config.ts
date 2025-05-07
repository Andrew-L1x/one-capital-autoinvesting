export const config = {
  network: 'l1x-testnet',
  rpcUrl: 'https://v2-testnet-rpc.l1x.foundation',
  privateKey: process.env.DEPLOYER_PRIVATE_KEY || '',
  l1xBridge: {
    sepolia: '0xf650162aF059734523E4Be23Ec5bAB9a5b878f57',
    bscTestnet: '0x77d046D7d733672D44eA2Df53a1663b6CF453432'
  },
  dexRouter: process.env.DEX_ROUTER_ADDRESS || '',
  initialAssets: [
    '0x...', // BTC address
    '0x...', // ETH address
    '0x...', // L1X address
    '0x...', // USDC address
  ],
  initialWeights: [40, 30, 20, 10], // Percentages
}; 