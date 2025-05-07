require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Make sure you have these in your .env file
// PRIVATE_KEY=your_private_key
// BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
// SEPOLIA_RPC_URL=https://rpc.sepolia.org
// L1X_RPC_URL=https://rpc.testnet.layeronex.net

// Ensure private key starts with 0x
const PRIVATE_KEY = process.env.PRIVATE_KEY 
  ? process.env.PRIVATE_KEY.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : `0x${process.env.PRIVATE_KEY}`
  : "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
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
      url: "https://bsc-testnet.public.blastapi.io",
      chainId: 97,
      accounts: [PRIVATE_KEY],
      timeout: 90000, // Increase timeout to 90 seconds
      gasPrice: 10000000000, // 10 gwei
      verify: {
        etherscan: {
          apiKey: process.env.BSCSCAN_API_KEY
        }
      }
    },
    sepolia: {
      url: "https://ethereum-sepolia.publicnode.com",
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
      timeout: 90000, // Increase timeout to 90 seconds
      gasPrice: 20000000000, // 20 gwei
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY
        }
      }
    },
    l1xTestnet: {
      url: process.env.L1X_RPC_URL || "https://rpc.testnet.layeronex.net",
      chainId: 1067,
      accounts: [PRIVATE_KEY],
      timeout: 60000 // Increase timeout to 60 seconds
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
