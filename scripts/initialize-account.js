const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Initializing account:", deployer.address);

    try {
        // Get current balance
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Current balance:", hre.ethers.formatEther(balance), "ETH");

        // If balance is 0, we need to get testnet tokens
        if (balance === 0n) {
            console.log("Account has 0 balance. Please get testnet tokens from the L1X faucet.");
            console.log("You can request testnet tokens from: https://faucet.l1x.foundation");
            return;
        }

        // Send a small transaction to initialize the account
        const tx = await deployer.sendTransaction({
            to: deployer.address,
            value: hre.ethers.parseEther("0.0001"),
            gasLimit: 21000 // Standard gas limit for simple transfers
        });
        
        console.log("Transaction hash:", tx.hash);
        console.log("Waiting for transaction confirmation...");
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        
        // Check final balance
        const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Final balance:", hre.ethers.formatEther(finalBalance), "ETH");
        
        console.log("Account initialized successfully!");
    } catch (error) {
        console.error("Error initializing account:", error.message);
        if (error.message.includes("insufficient funds")) {
            console.log("\nPlease get testnet tokens from: https://faucet.l1x.foundation");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 