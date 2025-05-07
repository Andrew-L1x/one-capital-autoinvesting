import { ethers } from 'ethers';
import { config } from '../src/config';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Connect to L1X testnet
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  console.log('Deploying contracts...');
  console.log('Network:', await provider.getNetwork());
  console.log('Deployer address:', wallet.address);

  // Get the appropriate bridge address based on the network
  const network = process.env.NETWORK || 'sepolia';
  const bridgeAddress = config.l1xBridge[network as keyof typeof config.l1xBridge];
  
  if (!bridgeAddress) {
    throw new Error(`No bridge address configured for network: ${network}`);
  }

  // Load contract artifacts
  const portfolioFactoryArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../artifacts/contracts/PortfolioFactory.sol/PortfolioFactory.json'),
      'utf8'
    )
  );

  // Deploy PortfolioFactory
  const factory = new ethers.ContractFactory(
    portfolioFactoryArtifact.abi,
    portfolioFactoryArtifact.bytecode,
    wallet
  );
  
  const factoryContract = await factory.deploy(bridgeAddress, config.dexRouter);
  await factoryContract.waitForDeployment();
  
  const factoryAddress = await factoryContract.getAddress();
  console.log('PortfolioFactory deployed to:', factoryAddress);

  // Deploy initial Portfolio
  const tx = await factoryContract.createPortfolio(
    config.initialAssets,
    config.initialWeights
  );
  const receipt = await tx.wait();

  // Get the Portfolio address from the event
  const event = receipt.logs.find(
    log => log.fragment?.name === 'PortfolioCreated'
  );
  const portfolioAddress = event?.args[1];
  console.log('Portfolio deployed to:', portfolioAddress);

  // Save the addresses to a config file
  const addresses = {
    factory: factoryAddress,
    portfolio: portfolioAddress,
    network: config.network,
    bridge: bridgeAddress
  };

  console.log('Deployment complete!');
  console.log('Contract addresses:', addresses);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 