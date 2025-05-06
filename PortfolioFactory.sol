// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IL1XBridge {
    function bridgeAsset(address fromToken, uint256 amount, uint256 toChainId, address recipient) external;
}

contract Portfolio {
    address public owner;
    address[] public assets;
    uint[] public weights;
    address public l1xBridge;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _owner, address[] memory _assets, uint[] memory _weights, address _l1xBridge) {
        owner = _owner;
        assets = _assets;
        weights = _weights;
        l1xBridge = _l1xBridge;
    }

    function updateWeights(uint[] memory newWeights) external onlyOwner {
        require(newWeights.length == weights.length, "Length mismatch");
        weights = newWeights;
    }

    function rebalance(uint[] memory balances) external onlyOwner {
        require(balances.length == assets.length, "Mismatch");
        // Add rebalance logic using price feeds/oracles + L1X bridging if needed
    }

    function crossChainMove(uint assetIndex, uint256 amount, uint256 targetChainId, address to) external onlyOwner {
        IL1XBridge(l1xBridge).bridgeAsset(assets[assetIndex], amount, targetChainId, to);
    }

    function getPortfolio() external view returns (address[] memory, uint[] memory) {
        return (assets, weights);
    }
}
 
