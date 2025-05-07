const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    const Swap = await hre.ethers.getContractFactory("Swap");
    const swapContract = await Swap.deploy();

    await swapContract.waitForDeployment();

    const contractAddress = await swapContract.getAddress();
    console.log("Swap contract deployed to:", contractAddress);

    // Get the network name
    const network = hre.network.name;
    console.log("Network:", network);
    
    // Get the event topic for registration
    const eventSignature = "XTalkMessageBroadcasted(bytes,string,string)";
    const eventTopic = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(eventSignature));
    console.log("Event topic for registration:", eventTopic);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 