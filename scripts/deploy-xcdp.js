const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    const XCDP = await hre.ethers.getContractFactory("XCDPCore");
    // Deploy without constructor parameters since the contract doesn't have any
    const XCDPContract = await XCDP.deploy();

    await XCDPContract.waitForDeployment();

    const contractAddress = await XCDPContract.getAddress();
    console.log("XCDP contract deployed to:", contractAddress);

    // Set the gateway contract address
    // TODO: Replace with actual gateway address for the network
    const gatewayAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual gateway address
    await XCDPContract.setGatewayContractAddress(gatewayAddress);
    console.log("Gateway contract address set to:", gatewayAddress);

    // Verify the deployment
    console.log("\nDeployment verification:");
    console.log("Current gateway address:", await XCDPContract.gatewayContractAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 