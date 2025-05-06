const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Portfolio", function () {
  let portfolio;
  let owner;
  let addr1;
  let addr2;
  let mockToken1;
  let mockToken2;
  let mockPriceFeed1;
  let mockPriceFeed2;
  let mockSwapRouter;
  let mockL1XBridge;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    mockToken1 = await MockToken.deploy("Mock Token 1", "MTK1");
    await mockToken1.deployed();
    mockToken2 = await MockToken.deploy("Mock Token 2", "MTK2");
    await mockToken2.deployed();

    // Deploy mock price feeds
    const MockPriceFeed = await ethers.getContractFactory("contracts/mocks/MockPriceFeed.sol:MockPriceFeed");
    mockPriceFeed1 = await MockPriceFeed.deploy(8, 100000000); // $1.00
    await mockPriceFeed1.deployed();
    mockPriceFeed2 = await MockPriceFeed.deploy(8, 200000000); // $2.00
    await mockPriceFeed2.deployed();

    // Deploy mock swap router
    const MockSwapRouter = await ethers.getContractFactory("contracts/mocks/MockSwapRouter.sol:MockSwapRouter");
    mockSwapRouter = await MockSwapRouter.deploy();
    await mockSwapRouter.deployed();

    // Deploy mock L1X bridge
    const MockL1XBridge = await ethers.getContractFactory("contracts/mocks/MockL1XBridge.sol:MockL1XBridge");
    mockL1XBridge = await MockL1XBridge.deploy();
    await mockL1XBridge.deployed();

    // Deploy Portfolio contract
    const Portfolio = await ethers.getContractFactory("Portfolio");
    portfolio = await Portfolio.deploy(
      owner.address,
      [mockToken1.address, mockToken2.address],
      [5000, 5000], // 50% each
      mockL1XBridge.address,
      mockSwapRouter.address,
      mockToken1.address // WETH address
    );
    await portfolio.deployed();

    // Add tokens to portfolio
    await portfolio.addToken(mockToken1.address, mockPriceFeed1.address);
    await portfolio.addToken(mockToken2.address, mockPriceFeed2.address);

    // Mint tokens to portfolio
    await mockToken1.mint(portfolio.address, ethers.utils.parseEther("100"));
    await mockToken2.mint(portfolio.address, ethers.utils.parseEther("50"));
  });

  describe("Rebalancing", function () {
    it("Should rebalance portfolio according to weights", async function () {
      // Initial balances
      const initialBalance1 = await mockToken1.balanceOf(portfolio.address);
      const initialBalance2 = await mockToken2.balanceOf(portfolio.address);

      // Update weights to 70/30
      await portfolio.updateWeights(
        [mockToken1.address, mockToken2.address],
        [7000, 3000]
      );

      // Trigger rebalance
      await portfolio.rebalance();

      // Check final balances
      const finalBalance1 = await mockToken1.balanceOf(portfolio.address);
      const finalBalance2 = await mockToken2.balanceOf(portfolio.address);

      // Calculate expected values based on prices
      // Token1: $1.00, Token2: $2.00
      // Total value = 100 * $1 + 50 * $2 = $200
      // After rebalance:
      // Token1 should be 70% of $200 = $140 worth = 140 tokens
      // Token2 should be 30% of $200 = $60 worth = 30 tokens
      expect(finalBalance1).to.be.closeTo(
        ethers.utils.parseEther("140"),
        ethers.utils.parseEther("1")
      );
      expect(finalBalance2).to.be.closeTo(
        ethers.utils.parseEther("30"),
        ethers.utils.parseEther("1")
      );
    });

    it("Should respect maximum price impact", async function () {
      // Set a very high price impact in mock router
      await mockSwapRouter.setPriceImpact(2000); // 20%

      // Try to rebalance
      await expect(portfolio.rebalance()).to.be.revertedWith(
        "Price impact too high"
      );
    });

    it("Should emit SwapExecuted event", async function () {
      await expect(portfolio.rebalance())
        .to.emit(portfolio, "SwapExecuted")
        .withArgs(
          mockToken2.address,
          mockToken1.address,
          ethers.utils.parseEther("20"),
          ethers.utils.parseEther("20")
        );
    });
  });

  describe("Weight Updates", function () {
    it("Should update weights correctly", async function () {
      await portfolio.updateWeights(
        [mockToken1.address, mockToken2.address],
        [3000, 7000]
      );

      const weights = await portfolio.getWeights();
      expect(weights[0]).to.equal(3000);
      expect(weights[1]).to.equal(7000);
    });

    it("Should revert if weights don't sum to 100%", async function () {
      await expect(
        portfolio.updateWeights(
          [mockToken1.address, mockToken2.address],
          [3000, 8000]
        )
      ).to.be.revertedWith("Weights must sum to 100%");
    });
  });

  describe("Price Impact", function () {
    it("Should calculate price impact correctly", async function () {
      // Set a 5% price impact in mock router
      await mockSwapRouter.setPriceImpact(500);

      const priceImpact = await portfolio.calculatePriceImpact(
        mockToken1.address,
        mockToken2.address,
        ethers.utils.parseEther("10")
      );

      expect(priceImpact).to.equal(500);
    });
  });
}); 