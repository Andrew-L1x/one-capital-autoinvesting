// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Portfolio.sol";

contract PortfolioFactory {
    address public l1xBridge;
    address public dexRouter;
    mapping(address => Portfolio[]) public userPortfolios;

    event PortfolioCreated(address indexed owner, address indexed portfolio);

    constructor(address _l1xBridge, address _dexRouter) {
        require(_l1xBridge != address(0), "Invalid bridge address");
        require(_dexRouter != address(0), "Invalid DEX router address");
        l1xBridge = _l1xBridge;
        dexRouter = _dexRouter;
    }

    function createPortfolio(address[] memory assets, uint[] memory weights) external returns (address) {
        require(assets.length == weights.length, "Length mismatch");
        require(assets.length > 0, "No assets provided");
        
        // Validate weights sum to 100
        uint totalWeight = 0;
        for(uint i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
        }
        require(totalWeight == 100, "Weights must sum to 100");
        
        Portfolio portfolio = new Portfolio(
            msg.sender,
            assets,
            weights,
            l1xBridge,
            dexRouter
        );
        userPortfolios[msg.sender].push(portfolio);
        
        emit PortfolioCreated(msg.sender, address(portfolio));
        return address(portfolio);
    }

    function getUserPortfolios(address user) external view returns (Portfolio[] memory) {
        return userPortfolios[user];
    }

    function getPortfolioCount(address user) external view returns (uint) {
        return userPortfolios[user].length;
    }
}
 
