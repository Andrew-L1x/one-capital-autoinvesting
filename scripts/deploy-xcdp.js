const hre = require("hardhat");

async function main() {
    console.log("Starting deployment process...");
    console.log("Network:", hre.network.name);

    try {
        const [deployer] = await hre.ethers.getSigners();
        console.log("Using deployer address:", deployer.address);

        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");

        if (balance.toString() === '0') {
            throw new Error("Deployer account has no ETH!");
        }

        // Get the network name and set gateway address
        const network = hre.network.name;
        let gatewayAddress;

        console.log("Setting gateway address for network:", network);
        
        if (network === 'sepolia') {
            gatewayAddress = "0xf650162aF059734523E4Be23Ec5bAB9a5b878f57";
        } else if (network === 'bscTestnet') {
            gatewayAddress = "0x77d046D7d733672D44eA2Df53a1663b6CF453432";
        } else if (network === 'l1xTestnet') {
            // For L1X Testnet, we'll use the Sepolia gateway address
            gatewayAddress = "0xf650162aF059734523E4Be23Ec5bAB9a5b878f57";
        } else {
            throw new Error(`Unsupported network: ${network}`);
        }
        console.log("Using gateway address:", gatewayAddress);

        console.log("Creating contract factory...");
        const XCDP = await hre.ethers.getContractFactory("XCDPCore");
        
        console.log("Deploying contract...");
        const XCDPContract = await XCDP.deploy(gatewayAddress);

        console.log("Waiting for deployment transaction...");
        await XCDPContract.waitForDeployment();

        const contractAddress = await XCDPContract.getAddress();
        console.log("\nDeployment successful!");
        console.log("Contract deployed to:", contractAddress);
        console.log("Gateway contract address set to:", gatewayAddress);

        console.log("\nVerifying deployment...");
        const deployedGatewayAddress = await XCDPContract.gatewayContractAddress();
        console.log("Verified gateway address:", deployedGatewayAddress);
        
        if (deployedGatewayAddress.toLowerCase() !== gatewayAddress.toLowerCase()) {
            console.warn("Warning: Gateway address mismatch!");
        }
    } catch (error) {
        console.error("\nDeployment failed!");
        console.error("Error details:", error);
        throw error;
    }
}

main()
    .then(() => {
        console.log("\nDeployment script completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nDeployment script failed!");
        console.error(error);
        process.exit(1);
    }); 