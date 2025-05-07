const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Get the network name
    const network = hre.network.name;
    console.log("Network:", network);

    // Set contract addresses based on network
    let sourceSwapAddress, destinationSwapAddress, sourceTokenAddress, destinationTokenAddress;
    let destinationNetwork;

    if (network === 'sepolia') {
        sourceSwapAddress = "YOUR_SEPOLIA_SWAP_CONTRACT_ADDRESS";
        destinationSwapAddress = "YOUR_BSC_SWAP_CONTRACT_ADDRESS";
        sourceTokenAddress = "YOUR_SEPOLIA_TOKEN_ADDRESS";
        destinationTokenAddress = "YOUR_BSC_TOKEN_ADDRESS";
        destinationNetwork = "bscTestnet";
    } else if (network === 'bscTestnet') {
        sourceSwapAddress = "YOUR_BSC_SWAP_CONTRACT_ADDRESS";
        destinationSwapAddress = "YOUR_SEPOLIA_SWAP_CONTRACT_ADDRESS";
        sourceTokenAddress = "YOUR_BSC_TOKEN_ADDRESS";
        destinationTokenAddress = "YOUR_SEPOLIA_TOKEN_ADDRESS";
        destinationNetwork = "sepolia";
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }

    // Get contract instances
    const swap = await ethers.getContractFactory("Swap");
    const swapContract = swap.attach(sourceSwapAddress);

    const token = await ethers.getContractAt("IERC20", sourceTokenAddress);

    // Set amounts (adjust decimals as needed)
    const sourceAmount = ethers.parseUnits("1", 18); // 1 token with 18 decimals
    const destinationAmount = ethers.parseUnits("1", 18); // 1 token with 18 decimals

    console.log("Approving token transfer...");
    const approvalTx = await token.approve(sourceSwapAddress, sourceAmount);
    await approvalTx.wait();
    console.log("Token approval tx:", approvalTx.hash);

    console.log("Initiating swap...");
    const tx = await swapContract._l1xSend(
        deployer.address,
        deployer.address,
        sourceTokenAddress,
        destinationTokenAddress,
        sourceAmount,
        destinationAmount,
        destinationSwapAddress,
        destinationNetwork
    );

    await tx.wait();
    console.log("Swap initiated tx:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 