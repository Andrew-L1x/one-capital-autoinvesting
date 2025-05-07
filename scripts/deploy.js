const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    // Check account balance
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Get contract factories
    const PortfolioFactory = await hre.ethers.getContractFactory("PortfolioFactory");
    const Portfolio = await hre.ethers.getContractFactory("Portfolio");
    const L1XSwapper = await hre.ethers.getContractFactory("L1XSwapper");
    const AutoBalancer = await hre.ethers.getContractFactory("AutoBalancer");
    const MockToken = await hre.ethers.getContractFactory("MockToken");

    // Deploy base contracts first
    console.log("Deploying base contracts...");
    
    // Deploy AutoBalancer first
    const autoBalancer = await AutoBalancer.deploy();
    await autoBalancer.waitForDeployment();
    console.log("AutoBalancer deployed to:", await autoBalancer.getAddress());

    // Deploy L1XSwapper
    const swapper = await L1XSwapper.deploy(deployer.address);
    await swapper.waitForDeployment();
    console.log("L1XSwapper deployed to:", await swapper.getAddress());

    // Deploy mock tokens
    console.log("Deploying mock tokens...");
    const mockToken1 = await MockToken.deploy("Mock Token 1", "MT1");
    await mockToken1.waitForDeployment();
    console.log("MockToken1 deployed to:", await mockToken1.getAddress());

    const mockToken2 = await MockToken.deploy("Mock Token 2", "MT2");
    await mockToken2.waitForDeployment();
    console.log("MockToken2 deployed to:", await mockToken2.getAddress());

    // Deploy PortfolioFactory
    const l1xBridgeAddress = "0x0000000000000000000000000000000000000001"; // Placeholder address
    const portfolioFactory = await PortfolioFactory.deploy(l1xBridgeAddress, deployer.address);
    await portfolioFactory.waitForDeployment();
    console.log("PortfolioFactory deployed to:", await portfolioFactory.getAddress());

    // Deploy Portfolio
    const initialAssets = [await mockToken1.getAddress(), await mockToken2.getAddress()];
    const initialWeights = [50, 50]; // Equal weights of 50% each
    const portfolio = await Portfolio.deploy(
        deployer.address, // owner
        initialAssets,
        initialWeights,
        l1xBridgeAddress, // l1xBridge
        deployer.address // dexRouter
    );
    await portfolio.waitForDeployment();
    console.log("Portfolio deployed to:", await portfolio.getAddress());

    // Save addresses to .env file
    const envPath = path.join(__dirname, '..', '.env');
    const addresses = {
        PORTFOLIO_FACTORY_ADDRESS: await portfolioFactory.getAddress(),
        L1X_BRIDGE_ADDRESS: l1xBridgeAddress,
        DEX_ROUTER_ADDRESS: await swapper.getAddress(),
        MOCK_TOKEN1_ADDRESS: await mockToken1.getAddress(),
        MOCK_TOKEN2_ADDRESS: await mockToken2.getAddress(),
        PORTFOLIO_ADDRESS: await portfolio.getAddress(),
        AUTOBALANCER_ADDRESS: await autoBalancer.getAddress(),
        L1X_SWAPPER_ADDRESS: await swapper.getAddress()
    };

    let envContent = '';
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
        console.log('Creating new .env file');
    }

    // Update or add addresses
    for (const [key, value] of Object.entries(addresses)) {
        if (value) {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (envContent.match(regex)) {
                envContent = envContent.replace(regex, `${key}=${value}`);
            } else {
                envContent += `\n${key}=${value}`;
            }
        }
    }

    // Write back to .env file
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('\nContract addresses saved to .env file');

    // Log all addresses for easy reference
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("AutoBalancer:", await autoBalancer.getAddress());
    console.log("L1XSwapper:", await swapper.getAddress());
    console.log("MockToken1:", await mockToken1.getAddress());
    console.log("MockToken2:", await mockToken2.getAddress());
    console.log("PortfolioFactory:", await portfolioFactory.getAddress());
    console.log("Portfolio:", await portfolio.getAddress());
}

// Run the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
  
