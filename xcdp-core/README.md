# L1X Smart Contract Deployment

This directory contains the smart contracts and deployment scripts for the One Capital Auto-Investing platform.

## Prerequisites

1. Node.js (v16 or later)
2. Rust (latest stable version)
3. L1X Testnet Wallet with test tokens
4. Hardhat CLI (`npm install -g hardhat`)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
# Network Configuration
L1X_TESTNET_RPC_URL=https://testnet-rpc.l1x.foundation

# Private key for deployment (replace with your testnet wallet private key)
PRIVATE_KEY=your_private_key_here

# Contract Addresses (to be filled after deployment)
PORTFOLIO_FACTORY_ADDRESS=
L1X_BRIDGE_ADDRESS=
DEX_ROUTER_ADDRESS=

# Token Addresses
BTC_ADDRESS=
ETH_ADDRESS=
L1X_ADDRESS=
USDC_ADDRESS=
```

## Compilation

To compile the smart contracts:

```bash
npm run compile
```

This will compile the contracts and generate artifacts in the `artifacts` directory.

## Deployment

To deploy the contracts to the L1X testnet:

```bash
npm run deploy
```

This will:
1. Deploy the PortfolioFactory contract
2. Create an initial portfolio
3. Save the deployed contract addresses to the config file

## Testing

To run the test suite:

```bash
npm test
```

## Contract Addresses

After deployment, update the following files with the deployed contract addresses:

1. `src/config.ts` - Update the contract addresses
2. `.env` - Update the contract addresses
3. Frontend configuration (if applicable)

## Security

- Never commit your `.env` file or expose your private keys
- Always use testnet for development and testing
- Verify contracts on the block explorer after deployment 