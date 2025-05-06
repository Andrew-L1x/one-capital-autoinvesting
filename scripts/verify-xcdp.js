const hre = require("hardhat");

async function main() {
    const contractAddress = "CONTRACT_ADDRESS"; // Replace with your deployed contract address

    console.log("Verifying contract...");
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // XCDPCore has no constructor arguments
        });
        console.log("Contract verified successfully");
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 