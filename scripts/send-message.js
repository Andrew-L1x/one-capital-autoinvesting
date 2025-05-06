const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Sending message with account:", deployer.address);

    const XCDPCore = await hre.ethers.getContractFactory("XCDPCore");
    const xcdpCoreAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace with actual deployed address
    const xcdpCore = XCDPCore.attach(xcdpCoreAddress);

    const message = "Hello from L1X!";
    const destinationAddress = "YOUR_DESTINATION_CONTRACT_ADDRESS"; // Replace with actual destination address
    const destinationNetwork = "l1x"; // or your target network

    console.log("Sending message:", message);
    console.log("To network:", destinationNetwork);
    console.log("To contract:", destinationAddress);

    const tx = await xcdpCore._l1xSend(
        message,
        destinationAddress,
        destinationNetwork
    );

    await tx.wait();

    console.log("Message sent! Transaction hash:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 