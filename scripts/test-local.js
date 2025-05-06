const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const PortfolioFactory = await hre.ethers.getContractFactory("PortfolioFactory");
    const factory = await PortfolioFactory.attach("0xc351628EB244ec633d5f21fBD6621e1a683B1181");

    // Test assets (using deployed contract addresses and generating additional ones)
    const testAssets = [
        "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc", // L1XSwapper
        "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f", // AutoBalancer
        "0xFD471836031dc5108809D173A067e8486B9047A3", // Portfolio
        "0xc351628EB244ec633d5f21fBD6621e1a683B1181", // PortfolioFactory
        "0x79E4D62d828379720db8E0E9511e10e6Bac05351", // Previously deployed portfolio
        "0x73269463D5A325Aca756Ec4dFbAC5F1eb81602C9", // Another deployed contract
        "0x120E77dBF77a6A7B4a3a954d9F540302200BaB69", // Another deployed contract
        "0x55652FF92Dc17a21AD6810Cce2F4703fa2339CAE", // Another deployed contract
        "0xa37aE2b259D35aF4aBdde122eC90B204323ED304", // Another deployed contract
        "0x624dC0EcEFD94640D316eE3ACfD147Ed9B764638"  // Another deployed contract
    ];

    // Test different portfolio sizes and weight distributions
    const testCases = [
        {
            name: "3 assets - Standard",
            assets: testAssets.slice(0, 3),
            weights: [40, 35, 25]
        },
        {
            name: "5 assets - Equal",
            assets: testAssets.slice(0, 5),
            weights: [20, 20, 20, 20, 20]
        },
        {
            name: "7 assets - Descending",
            assets: testAssets.slice(0, 7),
            weights: [30, 20, 15, 12, 10, 8, 5]
        },
        {
            name: "10 assets - Mixed",
            assets: testAssets,
            weights: [20, 15, 12, 11, 10, 9, 8, 7, 5, 3]
        },
        // Edge cases
        {
            name: "2 assets - Extreme (99-1)",
            assets: testAssets.slice(0, 2),
            weights: [99, 1]
        },
        {
            name: "3 assets - Very Small Weights",
            assets: testAssets.slice(0, 3),
            weights: [98, 1, 1]
        },
        {
            name: "5 assets - Mixed Small Weights",
            assets: testAssets.slice(0, 5),
            weights: [95, 2, 1, 1, 1]
        },
        {
            name: "7 assets - Minimum Weights",
            assets: testAssets.slice(0, 7),
            weights: [94, 1, 1, 1, 1, 1, 1]
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n=== Testing ${testCase.name} ===`);
        
        // Test 1: Create portfolio
        console.log("\nTest 1: Creating portfolio...");
        const tx = await factory.createPortfolio(testCase.assets, testCase.weights);
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === 'PortfolioCreated');
        const portfolioAddress = event.args.portfolio;
        const owner = event.args.owner;
        console.log("New portfolio created at:", portfolioAddress);
        console.log("Portfolio owner:", owner);

        // Get the Portfolio contract
        const Portfolio = await hre.ethers.getContractFactory("Portfolio");
        const portfolio = await Portfolio.attach(portfolioAddress);

        // Test 2: Verify initial state
        console.log("\nTest 2: Verifying initial state...");
        const [assets, weights] = await portfolio.getPortfolio();
        console.log("Assets count:", assets.length);
        console.log("Weights:", weights.map(w => w.toString()));
        
        // Test 3: Update weights with different distribution
        console.log("\nTest 3: Testing weight updates...");
        try {
            // Create new weights that sum to 100
            const newWeights = Array(assets.length).fill(0);
            const baseWeight = Math.floor(100 / assets.length);
            let remainingWeight = 100;
            
            for(let i = 0; i < assets.length - 1; i++) {
                newWeights[i] = baseWeight;
                remainingWeight -= baseWeight;
            }
            newWeights[assets.length - 1] = remainingWeight;
            
            console.log("Attempting to update weights to:", newWeights);
            const updateTx = await portfolio.updateWeights(newWeights);
            await updateTx.wait();
            const [_, updatedWeights] = await portfolio.getPortfolio();
            console.log("Updated weights:", updatedWeights.map(w => w.toString()));
        } catch (error) {
            console.log("Error updating weights:", error.message);
        }

        // Test 4: Try adding another asset
        if (assets.length < 10) {
            console.log("\nTest 4: Adding another asset...");
            try {
                const newAsset = testAssets[assets.length];
                // For edge cases, try adding with very small weight
                const newWeight = testCase.name.includes("Extreme") || testCase.name.includes("Small") ? 1 : 10;
                const addTx = await portfolio.addAsset(newAsset, newWeight);
                await addTx.wait();
                const [finalAssets, finalWeights] = await portfolio.getPortfolio();
                console.log("Updated asset count:", finalAssets.length);
                console.log("Final weights:", finalWeights.map(w => w.toString()));
            } catch (error) {
                console.log("Error adding asset:", error.message);
            }
        }

        // Test 5: Verify final state
        console.log("\nTest 5: Final portfolio state...");
        const [finalAssets, finalWeights] = await portfolio.getPortfolio();
        const assetCount = await portfolio.getAssetCount();
        console.log("Final asset count:", assetCount.toString());
        console.log("Final weights:", finalWeights.map(w => w.toString()));
        console.log("Weight sum:", finalWeights.reduce((a, b) => a + Number(b), 0));
        
        // Test 6: Try updating to extreme weights
        console.log("\nTest 6: Testing extreme weight update...");
        try {
            const extremeWeights = Array(finalAssets.length).fill(1);
            extremeWeights[0] = 100 - (finalAssets.length - 1);
            console.log("Attempting to update to extreme weights:", extremeWeights);
            const updateTx = await portfolio.updateWeights(extremeWeights);
            await updateTx.wait();
            const [__, extremeUpdatedWeights] = await portfolio.getPortfolio();
            console.log("Extreme weights result:", extremeUpdatedWeights.map(w => w.toString()));
        } catch (error) {
            console.log("Error updating to extreme weights:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 