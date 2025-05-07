import { ethers } from 'ethers';
import { config } from '../src/config';
import PortfolioFactory from '../artifacts/contracts/PortfolioFactory.sol/PortfolioFactory.json';
import Portfolio from '../artifacts/contracts/Portfolio.sol/Portfolio.json';

async function main() {
  // Connect to L1X testnet
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  console.log('Deploying contracts...');
  console.log('Network:', await provider.getNetwork());
  console.log('Deployer address:', wallet.address);

  // Deploy PortfolioFactory
  const factory = await ethers.deployContract('PortfolioFactory', [
    config.l1xBridge,
    config.dexRouter
  ], wallet);

  await factory.waitForDeployment();
  console.log('PortfolioFactory deployed to:', await factory.getAddress());

  // Deploy initial Portfolio
  const tx = await factory.createPortfolio(
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
    factory: await factory.getAddress(),
    portfolio: portfolioAddress,
    network: config.network
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