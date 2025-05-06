const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get contract factories
    const PortfolioFactory = await hre.ethers.getContractFactory("PortfolioFactory");
    const Portfolio = await hre.ethers.getContractFactory("Portfolio");
    const L1XSwapper = await hre.ethers.getContractFactory("L1XSwapper");
    const AutoBalancer = await hre.ethers.getContractFactory("AutoBalancer");

    // Deploy contracts
    console.log("Deploying contracts...");

    // Deploy PortfolioFactory with a Layer One X bridge address
    const l1xBridgeAddress = "0x0000000000000000000000000000000000000001"; // Placeholder address
    const portfolioFactory = await PortfolioFactory.deploy(l1xBridgeAddress);
    await portfolioFactory.deployed();
    console.log("PortfolioFactory deployed to:", portfolioFactory.address);

    // Deploy Portfolio contract
    const portfolio = await Portfolio.deploy(
        deployer.address, // owner
        [], // initial assets
        [], // initial weights
        deployer.address, // l1xBridge (using deployer address as placeholder)
        deployer.address  // dexRouter (using deployer address as placeholder)
    );
    await portfolio.deployed();
    console.log("Portfolio deployed to:", portfolio.address);

    // Deploy L1XSwapper contract
    const dexAddress = "0x0000000000000000000000000000000000000005"; // Placeholder DEX address
    const swapper = await L1XSwapper.deploy(dexAddress);
    await swapper.deployed();
    console.log("L1XSwapper deployed to:", swapper.address);

    // Deploy AutoBalancer contract
    const autoBalancer = await AutoBalancer.deploy();
    await autoBalancer.deployed();
    console.log("AutoBalancer deployed to:", autoBalancer.address);
}

// Run the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
  
