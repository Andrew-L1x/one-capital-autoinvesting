const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get contract factories
    const PortfolioFactory = await hre.ethers.getContractFactory("PortfolioFactory");
    const Portfolio = await hre.ethers.getContractFactory("Portfolio");
    const L1XSwapper = await hre.ethers.getContractFactory("L1XSwapper");
    const AutoBalancer = await hre.ethers.getContractFactory("AutoBalancer");
    const MockToken = await hre.ethers.getContractFactory("MockToken");

    // Deploy mock tokens for testing
    console.log("Deploying mock tokens...");
    const mockToken1 = await MockToken.deploy("Mock Token 1", "MT1");
    await mockToken1.deployed();
    console.log("MockToken1 deployed to:", mockToken1.address);

    const mockToken2 = await MockToken.deploy("Mock Token 2", "MT2");
    await mockToken2.deployed();
    console.log("MockToken2 deployed to:", mockToken2.address);

    // Deploy mock DEX router first (using deployer address as placeholder)
    const dexRouter = deployer.address;

    // Deploy PortfolioFactory with a Layer One X bridge address and DEX router
    const l1xBridgeAddress = "0x0000000000000000000000000000000000000001"; // Placeholder address
    const portfolioFactory = await PortfolioFactory.deploy(l1xBridgeAddress, dexRouter);
    await portfolioFactory.deployed();
    console.log("PortfolioFactory deployed to:", portfolioFactory.address);

    // Deploy Portfolio contract with initial assets
    const initialAssets = [mockToken1.address, mockToken2.address];
    const initialWeights = [50, 50]; // Equal weights of 50% each
    const portfolio = await Portfolio.deploy(
        deployer.address, // owner
        initialAssets,
        initialWeights,
        l1xBridgeAddress, // l1xBridge
        dexRouter // dexRouter
    );
    await portfolio.deployed();
    console.log("Portfolio deployed to:", portfolio.address);

    // Deploy L1XSwapper contract
    const swapper = await L1XSwapper.deploy(dexRouter);
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
  
