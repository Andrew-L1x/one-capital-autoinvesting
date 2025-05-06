const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    // Deploy mock ERC20 tokens
    const MockToken = await hre.ethers.getContractFactory("MockERC20");
    const token1 = await MockToken.deploy("Token1", "TK1");
    const token2 = await MockToken.deploy("Token2", "TK2");
    
    console.log("Token1 deployed to:", await token1.getAddress());
    console.log("Token2 deployed to:", await token2.getAddress());

    // Deploy mock DEX router
    const MockDEXRouter = await hre.ethers.getContractFactory("MockDEXRouter");
    const dexRouter = await MockDEXRouter.deploy();
    console.log("MockDEXRouter deployed to:", await dexRouter.getAddress());

    // Deploy portfolio factory with dummy bridge address
    const PortfolioFactory = await hre.ethers.getContractFactory("PortfolioFactory");
    const dummyBridgeAddress = "0x0000000000000000000000000000000000000001";
    const factory = await PortfolioFactory.deploy(dummyBridgeAddress, await dexRouter.getAddress());
    
    console.log("PortfolioFactory deployed to:", await factory.getAddress());

    const [owner] = await hre.ethers.getSigners();
    const tx = await factory.createPortfolio(
        [await token1.getAddress(), await token2.getAddress()],
        [50, 50]
    );
    
    const receipt = await tx.wait();
    const portfolioAddress = receipt.logs[0].args[1];
    console.log("Portfolio created at:", portfolioAddress);

    // Get Portfolio contract
    const Portfolio = await hre.ethers.getContractFactory("Portfolio");
    const portfolio = await Portfolio.attach(portfolioAddress);

    // Mint initial tokens and transfer to portfolio
    const initialAmount1 = hre.ethers.parseEther("1000");
    const initialAmount2 = hre.ethers.parseEther("1000");
    
    await token1.mint(portfolioAddress, initialAmount1);
    await token2.mint(portfolioAddress, initialAmount2);

    // Set initial prices (1:1)
    await portfolio.updatePrice(await token1.getAddress(), hre.ethers.parseEther("1"));
    await portfolio.updatePrice(await token2.getAddress(), hre.ethers.parseEther("1"));

    console.log("\nInitial state:");
    const initialBalances = await portfolio.getCurrentBalances();
    console.log("Initial balances (%):", initialBalances.map(b => b.toString()));

    // Test different rebalancing frequencies
    console.log("\nTesting different rebalancing frequencies:");

    // Test 1: Daily rebalancing
    console.log("\nTest 1: Daily rebalancing");
    await portfolio.setRebalanceFrequency(0); // DAILY
    console.log("Current frequency:", await portfolio.getRebalanceFrequencyString());
    console.log("Next rebalance in:", (await portfolio.timeUntilNextRebalance()).toString(), "seconds");
    
    // Advance time by 1 day
    await time.increase(24 * 3600);
    console.log("After 1 day, should rebalance:", await portfolio.shouldRebalance());

    // Test 2: Weekly rebalancing
    console.log("\nTest 2: Weekly rebalancing");
    await portfolio.setRebalanceFrequency(1); // WEEKLY
    console.log("Current frequency:", await portfolio.getRebalanceFrequencyString());
    console.log("Next rebalance in:", (await portfolio.timeUntilNextRebalance()).toString(), "seconds");
    
    // Advance time by 3 days
    await time.increase(3 * 24 * 3600);
    console.log("After 3 days, should rebalance:", await portfolio.shouldRebalance());
    
    // Advance time by 4 more days
    await time.increase(4 * 24 * 3600);
    console.log("After 7 days, should rebalance:", await portfolio.shouldRebalance());

    // Test 3: Monthly rebalancing
    console.log("\nTest 3: Monthly rebalancing");
    await portfolio.setRebalanceFrequency(2); // MONTHLY
    console.log("Current frequency:", await portfolio.getRebalanceFrequencyString());
    console.log("Next rebalance in:", (await portfolio.timeUntilNextRebalance()).toString(), "seconds");
    
    // Advance time by 15 days
    await time.increase(15 * 24 * 3600);
    console.log("After 15 days, should rebalance:", await portfolio.shouldRebalance());
    
    // Advance time by 15 more days
    await time.increase(15 * 24 * 3600);
    console.log("After 30 days, should rebalance:", await portfolio.shouldRebalance());

    // Test 4: Quarterly rebalancing
    console.log("\nTest 4: Quarterly rebalancing");
    await portfolio.setRebalanceFrequency(3); // QUARTERLY
    console.log("Current frequency:", await portfolio.getRebalanceFrequencyString());
    console.log("Next rebalance in:", (await portfolio.timeUntilNextRebalance()).toString(), "seconds");
    
    // Advance time by 45 days
    await time.increase(45 * 24 * 3600);
    console.log("After 45 days, should rebalance:", await portfolio.shouldRebalance());
    
    // Advance time by 45 more days
    await time.increase(45 * 24 * 3600);
    console.log("After 90 days, should rebalance:", await portfolio.shouldRebalance());

    // Test 5: Yearly rebalancing
    console.log("\nTest 5: Yearly rebalancing");
    await portfolio.setRebalanceFrequency(4); // YEARLY
    console.log("Current frequency:", await portfolio.getRebalanceFrequencyString());
    console.log("Next rebalance in:", (await portfolio.timeUntilNextRebalance()).toString(), "seconds");
    
    // Advance time by 180 days
    await time.increase(180 * 24 * 3600);
    console.log("After 180 days, should rebalance:", await portfolio.shouldRebalance());
    
    // Advance time by 185 more days
    await time.increase(185 * 24 * 3600);
    console.log("After 365 days, should rebalance:", await portfolio.shouldRebalance());

    // Test 6: Perform actual rebalance
    console.log("\nTest 6: Performing rebalance");
    // Update price to trigger deviation
    await portfolio.updatePrice(await token1.getAddress(), hre.ethers.parseEther("1.2"));
    await portfolio.toggleAutoRebalance(true);
    
    if (await portfolio.shouldRebalance()) {
        console.log("Performing rebalance...");
        const rebalanceTx = await portfolio.rebalance();
        const rebalanceReceipt = await rebalanceTx.wait();
        
        const swapEvents = rebalanceReceipt.logs.filter(log => log.fragment.name === 'SwapExecuted');
        console.log("Number of swaps executed:", swapEvents.length);
        
        for (const event of swapEvents) {
            console.log("Swap:", {
                tokenIn: event.args[0],
                tokenOut: event.args[1],
                amountIn: hre.ethers.formatEther(event.args[2]),
                amountOut: hre.ethers.formatEther(event.args[3])
            });
        }
    }

    // Test manual rebalancing
    console.log("\nTesting manual rebalancing:");

    // Test 1: Set minimum manual rebalance interval
    console.log("\nTest 1: Setting minimum manual rebalance interval");
    await portfolio.setMinManualRebalanceInterval(3600); // 1 hour
    console.log("Min manual rebalance interval:", (await portfolio.minManualRebalanceInterval()).toString(), "seconds");

    // Test 2: Try manual rebalance without deviation
    console.log("\nTest 2: Try manual rebalance without deviation");
    await portfolio.toggleAutoRebalance(true);
    console.log("Can manual rebalance:", await portfolio.canManualRebalance());
    try {
        await portfolio.manualRebalance();
        console.log("Manual rebalance succeeded");
    } catch (error) {
        console.log("Manual rebalance failed as expected:", error.message);
    }

    // Test 3: Create deviation and try manual rebalance
    console.log("\nTest 3: Create deviation and try manual rebalance");
    await portfolio.updatePrice(await token1.getAddress(), hre.ethers.parseEther("1.2")); // 20% increase
    console.log("Can manual rebalance:", await portfolio.canManualRebalance());
    
    try {
        const tx = await portfolio.manualRebalance();
        const receipt = await tx.wait();
        const events = receipt.logs.filter(log => log.fragment.name === 'ManualRebalancePerformed');
        console.log("Manual rebalance succeeded, events emitted:", events.length);
    } catch (error) {
        console.log("Manual rebalance failed:", error.message);
    }

    // Test 4: Try manual rebalance too soon
    console.log("\nTest 4: Try manual rebalance too soon");
    console.log("Time until next manual rebalance:", (await portfolio.timeUntilManualRebalance()).toString(), "seconds");
    try {
        await portfolio.manualRebalance();
        console.log("Manual rebalance succeeded unexpectedly");
    } catch (error) {
        console.log("Manual rebalance failed as expected:", error.message);
    }

    // Test 5: Wait for interval and try again
    console.log("\nTest 5: Wait for interval and try again");
    await time.increase(3600); // Advance time by 1 hour
    console.log("Time until next manual rebalance:", (await portfolio.timeUntilManualRebalance()).toString(), "seconds");
    console.log("Can manual rebalance:", await portfolio.canManualRebalance());
    
    try {
        const tx = await portfolio.manualRebalance();
        const receipt = await tx.wait();
        const events = receipt.logs.filter(log => log.fragment.name === 'ManualRebalancePerformed');
        console.log("Manual rebalance succeeded, events emitted:", events.length);
    } catch (error) {
        console.log("Manual rebalance failed:", error.message);
    }

    // Test 6: Test with price drop protection
    console.log("\nTest 6: Test with price drop protection");
    await portfolio.updatePrice(await token1.getAddress(), hre.ethers.parseEther("0.7")); // 30% drop
    console.log("Can manual rebalance:", await portfolio.canManualRebalance());
    try {
        await portfolio.manualRebalance();
        console.log("Manual rebalance succeeded unexpectedly");
    } catch (error) {
        console.log("Manual rebalance failed as expected:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 