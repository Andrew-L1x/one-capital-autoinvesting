// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IL1XBridge {
    function bridgeAsset(address fromToken, uint256 amount, uint256 toChainId, address recipient) external;
}

interface ISwapRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);
}

contract Portfolio is ReentrancyGuard, Pausable {
    struct Asset {
        address token;
        address priceFeed;
        uint256 targetWeight; // basis points (1/10000)
        uint256 lastBalance;
    }

    address public owner;
    Asset[] public assets;
    address public l1xBridge;
    address public swapRouter;
    address public weth; // Wrapped ETH address for routing
    
    uint256 public constant REBALANCE_THRESHOLD = 500; // 5% in basis points
    uint256 public constant SLIPPAGE_TOLERANCE = 100; // 1% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_PRICE_IMPACT = 200; // 2% max price impact

    event WeightsUpdated(address[] tokens, uint256[] weights);
    event Rebalanced(uint256 timestamp, uint256[] newBalances);
    event CrossChainMoved(address token, uint256 amount, uint256 targetChainId, address to);
    event SwapExecuted(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event PriceImpactExceeded(address tokenIn, address tokenOut, uint256 impact);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        address _owner,
        address[] memory _tokens,
        address[] memory _priceFeeds,
        uint256[] memory _weights,
        address _l1xBridge,
        address _swapRouter,
        address _weth
    ) {
        require(_tokens.length == _weights.length && _tokens.length == _priceFeeds.length, "Length mismatch");
        require(_tokens.length > 0, "Empty portfolio");
        
        uint256 totalWeight = 0;
        for (uint i = 0; i < _weights.length; i++) {
            totalWeight += _weights[i];
            assets.push(Asset({
                token: _tokens[i],
                priceFeed: _priceFeeds[i],
                targetWeight: _weights[i],
                lastBalance: 0
            }));
        }
        require(totalWeight == BASIS_POINTS, "Weights must sum to 100%");

        owner = _owner;
        l1xBridge = _l1xBridge;
        swapRouter = _swapRouter;
        weth = _weth;
    }

    function getLatestPrice(address priceFeed) public view returns (uint256) {
        (, int256 price,,,) = AggregatorV3Interface(priceFeed).latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price);
    }

    function getCurrentBalances() public view returns (uint256[] memory balances, uint256[] memory values) {
        balances = new uint256[](assets.length);
        values = new uint256[](assets.length);
        
        for (uint i = 0; i < assets.length; i++) {
            balances[i] = IERC20(assets[i].token).balanceOf(address(this));
            values[i] = balances[i] * getLatestPrice(assets[i].priceFeed);
        }
    }

    function needsRebalancing() public view returns (bool) {
        (uint256[] memory balances, uint256[] memory values) = getCurrentBalances();
        uint256 totalValue = 0;
        
        for (uint i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        
        for (uint i = 0; i < assets.length; i++) {
            uint256 currentWeight = (values[i] * BASIS_POINTS) / totalValue;
            if (abs(int256(currentWeight) - int256(assets[i].targetWeight)) > REBALANCE_THRESHOLD) {
                return true;
            }
        }
        return false;
    }

    function calculatePriceImpact(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint256[] memory amounts = ISwapRouter(swapRouter).getAmountsOut(amountIn, path);
        uint256 expectedOut = amounts[1];

        // Calculate price impact based on spot price
        uint256 spotPrice = getLatestPrice(assets[0].priceFeed); // Use first asset as reference
        uint256 expectedValue = (amountIn * spotPrice) / 1e18;
        uint256 actualValue = (expectedOut * spotPrice) / 1e18;

        if (expectedValue > actualValue) {
            return ((expectedValue - actualValue) * BASIS_POINTS) / expectedValue;
        }
        return 0;
    }

    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) internal returns (uint256) {
        // Check price impact
        uint256 priceImpact = calculatePriceImpact(tokenIn, tokenOut, amountIn);
        require(priceImpact <= MAX_PRICE_IMPACT, "Price impact too high");
        
        // Approve router to spend tokens
        IERC20(tokenIn).approve(swapRouter, amountIn);

        // Prepare swap path
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        // Execute swap
        uint256[] memory amounts = ISwapRouter(swapRouter).swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path,
            address(this),
            block.timestamp + 300 // 5 minute deadline
        );

        emit SwapExecuted(tokenIn, tokenOut, amountIn, amounts[1]);
        return amounts[1];
    }

    function rebalance() external nonReentrant whenNotPaused {
        require(needsRebalancing(), "No rebalancing needed");
        
        (uint256[] memory balances, uint256[] memory values) = getCurrentBalances();
        uint256 totalValue = 0;
        for (uint i = 0; i < values.length; i++) {
            totalValue += values[i];
        }

        // First pass: Calculate all target values and required swaps
        uint256[] memory targetValues = new uint256[](assets.length);
        uint256[] memory requiredSwaps = new uint256[](assets.length);
        
        for (uint i = 0; i < assets.length; i++) {
            targetValues[i] = (totalValue * assets[i].targetWeight) / BASIS_POINTS;
            if (values[i] < targetValues[i]) {
                requiredSwaps[i] = targetValues[i] - values[i];
            }
        }

        // Second pass: Execute swaps
        for (uint i = 0; i < assets.length; i++) {
            if (requiredSwaps[i] > 0) {
                // Find best token to swap from
                uint256 bestTokenIndex = 0;
                uint256 maxExcess = 0;
                
                for (uint j = 0; j < assets.length; j++) {
                    if (values[j] > targetValues[j]) {
                        uint256 excess = values[j] - targetValues[j];
                        if (excess > maxExcess) {
                            maxExcess = excess;
                            bestTokenIndex = j;
                        }
                    }
                }

                if (maxExcess > 0) {
                    // Calculate swap amounts
                    uint256 amountToSwap = (requiredSwaps[i] * 1e18) / getLatestPrice(assets[i].priceFeed);
                    uint256 amountFromSwap = (maxExcess * 1e18) / getLatestPrice(assets[bestTokenIndex].priceFeed);
                    
                    // Apply slippage tolerance
                    uint256 minAmountOut = (amountToSwap * (BASIS_POINTS - SLIPPAGE_TOLERANCE)) / BASIS_POINTS;
                    
                    // Execute swap
                    executeSwap(
                        assets[bestTokenIndex].token,
                        assets[i].token,
                        amountFromSwap,
                        minAmountOut
                    );
                }
            }
        }

        emit Rebalanced(block.timestamp, balances);
    }

    function updateWeights(uint256[] memory newWeights) external onlyOwner {
        require(newWeights.length == assets.length, "Length mismatch");
        
        uint256 totalWeight = 0;
        for (uint i = 0; i < newWeights.length; i++) {
            totalWeight += newWeights[i];
            assets[i].targetWeight = newWeights[i];
        }
        require(totalWeight == BASIS_POINTS, "Weights must sum to 100%");

        address[] memory tokens = new address[](assets.length);
        for (uint i = 0; i < assets.length; i++) {
            tokens[i] = assets[i].token;
        }
        
        emit WeightsUpdated(tokens, newWeights);
    }

    function crossChainMove(uint assetIndex, uint256 amount, uint256 targetChainId, address to) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(assetIndex < assets.length, "Invalid asset index");
        require(amount <= IERC20(assets[assetIndex].token).balanceOf(address(this)), "Insufficient balance");
        
        IL1XBridge(l1xBridge).bridgeAsset(assets[assetIndex].token, amount, targetChainId, to);
        emit CrossChainMoved(assets[assetIndex].token, amount, targetChainId, to);
    }

    function getPortfolio() external view returns (
        address[] memory tokens,
        uint256[] memory weights,
        uint256[] memory balances,
        uint256[] memory values
    ) {
        tokens = new address[](assets.length);
        weights = new uint256[](assets.length);
        
        for (uint i = 0; i < assets.length; i++) {
            tokens[i] = assets[i].token;
            weights[i] = assets[i].targetWeight;
        }
        
        (balances, values) = getCurrentBalances();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }
}

