// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IL1XBridge {
    function bridgeAsset(address fromToken, uint256 amount, uint256 toChainId, address recipient) external;
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IDEXRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract Portfolio {
    address public owner;
    address[] public assets;
    uint[] public weights;
    address public l1xBridge;
    address public dexRouter;
    
    // Rebalancing intervals
    enum RebalanceInterval {
        DAILY,      // 1 day
        WEEKLY,     // 7 days
        MONTHLY,    // 30 days
        QUARTERLY,  // 90 days
        YEARLY      // 365 days
    }
    
    // Auto-balancing parameters
    uint public lastRebalanceTime;
    RebalanceInterval public rebalanceFrequency;
    uint public rebalanceInterval;  // Time between rebalances (in seconds)
    uint public deviationThreshold; // Percentage threshold (1 = 1%)
    uint public slippageTolerance;  // Slippage tolerance (1 = 1%)
    bool public autoRebalanceEnabled;
    
    // Price tracking
    struct AssetPrice {
        uint lastPrice;
        uint lastUpdateTime;
        uint priceDropThreshold;    // User-defined threshold (1 = 1%)
        uint priceHistoryLength;    // Number of price points to track
        uint[] priceHistory;        // Historical prices
        uint[] priceTimestamps;     // Timestamps for historical prices
    }
    
    mapping(address => AssetPrice) public assetPrices;
    
    // Add new state variables for portfolio management
    mapping(address => bool) public isPortfolioOwner;
    mapping(address => uint256) public portfolioBalances;
    mapping(address => mapping(address => uint256)) public tokenBalances;

    // Events
    event WeightsUpdated(uint[] oldWeights, uint[] newWeights);
    event AssetAdded(address indexed asset, uint weight);
    event AssetRemoved(address indexed asset);
    event AutoRebalancePerformed(uint timestamp, uint[] oldBalances, uint[] newBalances);
    event RebalanceIntervalUpdated(RebalanceInterval newFrequency, uint newInterval);
    event DeviationThresholdUpdated(uint newThreshold);
    event SlippageToleranceUpdated(uint newSlippage);
    event AutoRebalanceToggled(bool enabled);
    event PriceUpdated(address indexed asset, uint oldPrice, uint newPrice);
    event SwapExecuted(address indexed tokenIn, address indexed tokenOut, uint amountIn, uint amountOut);
    event PriceDropThresholdUpdated(address indexed asset, uint oldThreshold, uint newThreshold);
    event PriceHistoryLengthUpdated(address indexed asset, uint oldLength, uint newLength);
    event ManualRebalancePerformed(uint timestamp, uint[] oldBalances, uint[] newBalances);
    event MinManualRebalanceIntervalUpdated(uint newInterval);
    event PortfolioCreated(address indexed owner);
    event FundsDeposited(address indexed owner, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    // Add new state variables
    uint public lastManualRebalanceTime;
    uint public minManualRebalanceInterval; // Minimum time between manual rebalances
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        address _owner, 
        address[] memory _assets, 
        uint[] memory _weights, 
        address _l1xBridge,
        address _dexRouter
    ) {
        require(_assets.length == _weights.length, "Length mismatch");
        require(_assets.length > 0, "No assets provided");
        require(validateWeights(_weights), "Invalid weights");
        require(_dexRouter != address(0), "Invalid DEX router");
        
        owner = _owner;
        assets = _assets;
        weights = _weights;
        l1xBridge = _l1xBridge;
        dexRouter = _dexRouter;
        
        // Initialize auto-balancing parameters
        lastRebalanceTime = block.timestamp;
        rebalanceFrequency = RebalanceInterval.DAILY;
        rebalanceInterval = 1 days;
        deviationThreshold = 5;     // Default 5% deviation threshold
        slippageTolerance = 1;      // Default 1% slippage tolerance
        autoRebalanceEnabled = false;
        
        // Initialize prices and thresholds for each asset
        for(uint i = 0; i < _assets.length; i++) {
            AssetPrice storage price = assetPrices[_assets[i]];
            price.lastPrice = 1e18; // Initialize with 1:1 price
            price.lastUpdateTime = block.timestamp;
            price.priceDropThreshold = 20; // Default 20% threshold
            price.priceHistoryLength = 24; // Default to 24 price points
            price.priceHistory = new uint[](24);
            price.priceTimestamps = new uint[](24);
            price.priceHistory[0] = 1e18;
            price.priceTimestamps[0] = block.timestamp;
        }
        
        // Initialize manual rebalance parameters
        lastManualRebalanceTime = block.timestamp;
        minManualRebalanceInterval = 1 hours; // Default 1 hour minimum between manual rebalances
    }

    function updatePrice(address asset, uint newPrice) external onlyOwner {
        require(assetExists(asset), "Asset not in portfolio");
        AssetPrice storage price = assetPrices[asset];
        
        // Update price history
        for(uint i = price.priceHistoryLength - 1; i > 0; i--) {
            price.priceHistory[i] = price.priceHistory[i-1];
            price.priceTimestamps[i] = price.priceTimestamps[i-1];
        }
        price.priceHistory[0] = newPrice;
        price.priceTimestamps[0] = block.timestamp;
        
        uint oldPrice = price.lastPrice;
        price.lastPrice = newPrice;
        price.lastUpdateTime = block.timestamp;
        
        emit PriceUpdated(asset, oldPrice, newPrice);
    }

    function setPriceDropThreshold(address asset, uint newThreshold) external onlyOwner {
        require(assetExists(asset), "Asset not in portfolio");
        require(newThreshold > 0 && newThreshold <= 50, "Invalid threshold");
        
        AssetPrice storage price = assetPrices[asset];
        uint oldThreshold = price.priceDropThreshold;
        price.priceDropThreshold = newThreshold;
        
        emit PriceDropThresholdUpdated(asset, oldThreshold, newThreshold);
    }

    function setPriceHistoryLength(address asset, uint newLength) external onlyOwner {
        require(assetExists(asset), "Asset not in portfolio");
        require(newLength > 0 && newLength <= 100, "Invalid length");
        
        AssetPrice storage price = assetPrices[asset];
        uint oldLength = price.priceHistoryLength;
        
        // Create new arrays with the new length
        uint[] memory newHistory = new uint[](newLength);
        uint[] memory newTimestamps = new uint[](newLength);
        
        // Copy existing data
        uint copyLength = oldLength < newLength ? oldLength : newLength;
        for(uint i = 0; i < copyLength; i++) {
            newHistory[i] = price.priceHistory[i];
            newTimestamps[i] = price.priceTimestamps[i];
        }
        
        price.priceHistory = newHistory;
        price.priceTimestamps = newTimestamps;
        price.priceHistoryLength = newLength;
        
        emit PriceHistoryLengthUpdated(asset, oldLength, newLength);
    }

    function checkPriceDrop() public view returns (bool) {
        for(uint i = 0; i < assets.length; i++) {
            address asset = assets[i];
            AssetPrice storage price = assetPrices[asset];
            
            if(price.lastPrice > 0 && price.priceHistory[0] > 0) {
                // Check immediate price drop
                if(price.lastPrice > price.priceHistory[0]) {
                    uint priceDrop = ((price.lastPrice - price.priceHistory[0]) * 100) / price.lastPrice;
                    if(priceDrop >= price.priceDropThreshold) {
                        return true;
                    }
                }
                
                // Check average price drop over history
                uint totalDrop = 0;
                uint validPoints = 0;
                for(uint j = 1; j < price.priceHistoryLength; j++) {
                    if(price.priceHistory[j] > 0 && price.priceHistory[0] > 0) {
                        if(price.priceHistory[j] > price.priceHistory[0]) {
                            uint pointDrop = ((price.priceHistory[j] - price.priceHistory[0]) * 100) / price.priceHistory[j];
                            totalDrop += pointDrop;
                            validPoints++;
                        }
                    }
                }
                
                if(validPoints > 0) {
                    uint avgDrop = totalDrop / validPoints;
                    if(avgDrop >= price.priceDropThreshold) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function checkDeviation() public view returns (bool) {
        if (!autoRebalanceEnabled) return false;
        if (checkPriceDrop()) return false;
        
        uint[] memory currentBalances = getCurrentBalances();
        
        for(uint i = 0; i < assets.length; i++) {
            if(currentBalances[i] > weights[i]) {
                if(currentBalances[i] - weights[i] > deviationThreshold) {
                    return true;
                }
            } else {
                if(weights[i] - currentBalances[i] > deviationThreshold) {
                    return true;
                }
            }
        }
        
        return false;
    }

    function shouldRebalance() public view returns (bool) {
        return autoRebalanceEnabled &&
               block.timestamp >= lastRebalanceTime + rebalanceInterval &&
               checkDeviation() &&
               !checkPriceDrop();
    }

    function calculateSwapAmounts(uint[] memory currentBalances) internal view returns (uint[] memory) {
        uint[] memory swapAmounts = new uint[](assets.length);
        uint totalValue = 0;
        
        // Calculate total value
        for(uint i = 0; i < assets.length; i++) {
            if(assetPrices[assets[i]].lastPrice > 0) {
                totalValue += currentBalances[i] * assetPrices[assets[i]].lastPrice / 1e18;
            }
        }
        
        // Calculate target values and swap amounts
        for(uint i = 0; i < assets.length; i++) {
            if(assetPrices[assets[i]].lastPrice > 0) {
                uint targetValue = (totalValue * weights[i]) / 100;
                uint currentValue = (currentBalances[i] * assetPrices[assets[i]].lastPrice) / 1e18;
                
                if(currentValue > targetValue) {
                    swapAmounts[i] = ((currentValue - targetValue) * 1e18) / assetPrices[assets[i]].lastPrice;
                }
            }
        }
        
        return swapAmounts;
    }

    function rebalance() public {
        require(autoRebalanceEnabled, "Auto-rebalance not enabled");
        require(block.timestamp >= lastRebalanceTime + rebalanceInterval, "Too soon to rebalance");
        require(checkDeviation(), "No significant deviation");
        require(!checkPriceDrop(), "Price drop too large");

        uint[] memory oldBalances = getCurrentBalances();
        uint[] memory swapAmounts = calculateSwapAmounts(oldBalances);
        
        // Execute swaps
        for(uint i = 0; i < assets.length; i++) {
            if(swapAmounts[i] > 0) {
                for(uint j = 0; j < assets.length; j++) {
                    if(i != j) {
                        uint targetAmount = (swapAmounts[i] * weights[j]) / 100;
                        if(targetAmount > 0) {
                            // Calculate minimum output with slippage protection
                            uint minOutput = (targetAmount * (100 - slippageTolerance)) / 100;
                            
                            // Approve DEX router
                            IERC20(assets[i]).approve(dexRouter, targetAmount);
                            
                            // Prepare swap path
                            address[] memory path = new address[](2);
                            path[0] = assets[i];
                            path[1] = assets[j];
                            
                            // Execute swap
                            uint[] memory amounts = IDEXRouter(dexRouter).swapExactTokensForTokens(
                                targetAmount,
                                minOutput,
                                path,
                                address(this),
                                block.timestamp + 300 // 5 minute deadline
                            );
                            
                            emit SwapExecuted(assets[i], assets[j], targetAmount, amounts[1]);
                        }
                    }
                }
            }
        }
        
        lastRebalanceTime = block.timestamp;
        emit AutoRebalancePerformed(block.timestamp, oldBalances, weights);
    }

    function getCurrentBalances() public view returns (uint[] memory) {
        uint[] memory balances = new uint[](assets.length);
        uint totalValue = 0;
        
        // First pass: calculate total value
        for(uint i = 0; i < assets.length; i++) {
            balances[i] = IERC20(assets[i]).balanceOf(address(this));
            totalValue += balances[i];
        }
        
        // Second pass: calculate percentages
        if(totalValue > 0) {
            for(uint i = 0; i < assets.length; i++) {
                balances[i] = (balances[i] * 100) / totalValue;
            }
        }
        
        return balances;
    }

    function setRebalanceFrequency(RebalanceInterval newFrequency) external onlyOwner {
        rebalanceFrequency = newFrequency;
        
        // Update interval based on frequency
        if (newFrequency == RebalanceInterval.DAILY) {
            rebalanceInterval = 1 days;
        } else if (newFrequency == RebalanceInterval.WEEKLY) {
            rebalanceInterval = 7 days;
        } else if (newFrequency == RebalanceInterval.MONTHLY) {
            rebalanceInterval = 30 days;
        } else if (newFrequency == RebalanceInterval.QUARTERLY) {
            rebalanceInterval = 90 days;
        } else if (newFrequency == RebalanceInterval.YEARLY) {
            rebalanceInterval = 365 days;
        }
        
        emit RebalanceIntervalUpdated(newFrequency, rebalanceInterval);
    }

    function getNextRebalanceTime() external view returns (uint) {
        return lastRebalanceTime + rebalanceInterval;
    }

    function getRebalanceFrequencyString() external view returns (string memory) {
        if (rebalanceFrequency == RebalanceInterval.DAILY) return "Daily";
        if (rebalanceFrequency == RebalanceInterval.WEEKLY) return "Weekly";
        if (rebalanceFrequency == RebalanceInterval.MONTHLY) return "Monthly";
        if (rebalanceFrequency == RebalanceInterval.QUARTERLY) return "Quarterly";
        if (rebalanceFrequency == RebalanceInterval.YEARLY) return "Yearly";
        return "Unknown";
    }

    function timeUntilNextRebalance() external view returns (uint) {
        uint nextRebalance = lastRebalanceTime + rebalanceInterval;
        if (block.timestamp >= nextRebalance) return 0;
        return nextRebalance - block.timestamp;
    }

    function setDeviationThreshold(uint newThreshold) external onlyOwner {
        require(newThreshold > 0 && newThreshold <= 20, "Invalid threshold");
        deviationThreshold = newThreshold;
        emit DeviationThresholdUpdated(newThreshold);
    }

    function toggleAutoRebalance(bool enabled) external onlyOwner {
        autoRebalanceEnabled = enabled;
        if (enabled) {
            lastRebalanceTime = block.timestamp;
        }
        emit AutoRebalanceToggled(enabled);
    }

    function addAsset(address asset, uint weight) public {
        require(isPortfolioOwner[msg.sender], "Not portfolio owner");
        require(!assetExists(asset), "Asset already exists");
        require(weight > 0 && weight <= 100, "Invalid weight");
        require(validateWeights(weights), "Invalid weights");
        
        assets.push(asset);
        weights.push(weight);
        
        // Initialize price tracking for new asset
        AssetPrice storage price = assetPrices[asset];
        price.lastPrice = 1e18;
        price.lastUpdateTime = block.timestamp;
        price.priceDropThreshold = 20;
        price.priceHistoryLength = 24;
        price.priceHistory = new uint[](24);
        price.priceTimestamps = new uint[](24);
        price.priceHistory[0] = 1e18;
        price.priceTimestamps[0] = block.timestamp;
        
        emit AssetAdded(asset, weight);
    }

    function removeAsset(uint assetIndex) external onlyOwner {
        require(assetIndex < assets.length, "Invalid asset index");
        
        address removedAsset = assets[assetIndex];
        uint removedWeight = weights[assetIndex];
        
        uint[] memory newWeights = new uint[](weights.length - 1);
        address[] memory newAssets = new address[](assets.length - 1);
        
        uint j = 0;
        for(uint i = 0; i < assets.length; i++) {
            if(i != assetIndex) {
                newAssets[j] = assets[i];
                newWeights[j] = weights[i] * 100 / (100 - removedWeight);
                j++;
            }
        }
        
        require(validateWeights(newWeights), "Invalid weights after removal");
        
        assets = newAssets;
        weights = newWeights;
        
        emit AssetRemoved(removedAsset);
    }

    function validateWeights(uint[] memory _weights) internal pure returns (bool) {
        uint total = 0;
        for(uint i = 0; i < _weights.length; i++) {
            total += _weights[i];
        }
        return total == 100;
    }

    function assetExists(address asset) internal view returns (bool) {
        for(uint i = 0; i < assets.length; i++) {
            if(assets[i] == asset) return true;
        }
        return false;
    }

    function crossChainMove(uint assetIndex, uint256 amount, uint256 targetChainId, address to) external onlyOwner {
        IL1XBridge(l1xBridge).bridgeAsset(assets[assetIndex], amount, targetChainId, to);
    }

    function getPortfolio() external view returns (address[] memory, uint[] memory) {
        return (assets, weights);
    }

    function getAssetCount() external view returns (uint) {
        return assets.length;
    }

    function setSlippageTolerance(uint newSlippage) external onlyOwner {
        require(newSlippage > 0 && newSlippage <= 5, "Invalid slippage");
        slippageTolerance = newSlippage;
        emit SlippageToleranceUpdated(newSlippage);
    }

    function updateWeights(uint[] memory newWeights) public {
        require(isPortfolioOwner[msg.sender], "Not portfolio owner");
        require(newWeights.length == assets.length, "Length mismatch");
        require(validateWeights(newWeights), "Invalid weights");
        
        uint[] memory oldWeights = weights;
        weights = newWeights;
        
        emit WeightsUpdated(oldWeights, newWeights);
    }

    function setMinManualRebalanceInterval(uint newInterval) external onlyOwner {
        require(newInterval >= 15 minutes, "Interval too short");
        require(newInterval <= 7 days, "Interval too long");
        minManualRebalanceInterval = newInterval;
        emit MinManualRebalanceIntervalUpdated(newInterval);
    }

    function canManualRebalance() public view returns (bool) {
        if (!autoRebalanceEnabled) return false;
        if (checkPriceDrop()) return false;
        if (block.timestamp < lastManualRebalanceTime + minManualRebalanceInterval) return false;
        
        // Check if there's significant deviation
        uint[] memory currentBalances = getCurrentBalances();
        for(uint i = 0; i < assets.length; i++) {
            if(currentBalances[i] > weights[i]) {
                if(currentBalances[i] - weights[i] > deviationThreshold) {
                    return true;
                }
            } else {
                if(weights[i] - currentBalances[i] > deviationThreshold) {
                    return true;
                }
            }
        }
        return false;
    }

    function timeUntilManualRebalance() external view returns (uint) {
        if (block.timestamp >= lastManualRebalanceTime + minManualRebalanceInterval) return 0;
        return (lastManualRebalanceTime + minManualRebalanceInterval) - block.timestamp;
    }

    function manualRebalance() public {
        require(isPortfolioOwner[msg.sender], "Not portfolio owner");
        require(block.timestamp >= lastManualRebalanceTime + minManualRebalanceInterval, "Too soon");
        
        uint[] memory oldBalances = getCurrentBalances();
        // Perform rebalancing logic here
        uint[] memory newBalances = getCurrentBalances();
        
        lastManualRebalanceTime = block.timestamp;
        emit ManualRebalancePerformed(block.timestamp, oldBalances, newBalances);
    }

    function createPortfolio() external {
        require(!isPortfolioOwner[msg.sender], "Portfolio already exists");
        isPortfolioOwner[msg.sender] = true;
        emit PortfolioCreated(msg.sender);
    }

    function depositFunds() external payable {
        require(isPortfolioOwner[msg.sender], "Not a portfolio owner");
        require(msg.value > 0, "Must deposit more than 0");
        portfolioBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function withdrawFunds(uint256 amount) external {
        require(isPortfolioOwner[msg.sender], "Not a portfolio owner");
        require(amount <= portfolioBalances[msg.sender], "Insufficient balance");
        portfolioBalances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(msg.sender, amount);
    }
}
