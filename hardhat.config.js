require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// Make sure you have these in your .env file
// PRIVATE_KEY=your_private_key
// BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
// SEPOLIA_RPC_URL=https://rpc.sepolia.org
// L1X_RPC_URL=https://v2-testnet-rpc.l1x.foundation

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    bscTestnet: {
      url: process.env.BSC_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    l1xTestnet: {
      url: process.env.L1X_RPC_URL || "https://v2-testnet-rpc.l1x.foundation",
      chainId: 1067,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
