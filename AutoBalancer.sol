// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPortfolio {
    function needsRebalancing() external view returns (bool);
    function rebalance() external;
}

contract AutoBalancer is Ownable, Pausable {
    uint256 public rebalanceInterval = 1 days;
    uint256 public lastRebalanceTime;
    uint256 public gasThreshold = 100 gwei;
    
    mapping(address => bool) public authorizedPortfolios;
    mapping(address => uint256) public portfolioLastRebalance;
    
    event PortfolioAuthorized(address indexed portfolio, bool status);
    event RebalanceTriggered(address indexed portfolio, uint256 timestamp);
    event IntervalUpdated(uint256 newInterval);
    event GasThresholdUpdated(uint256 newThreshold);

    constructor() Ownable(msg.sender) {}

    modifier onlyAuthorizedPortfolio(address portfolio) {
        require(authorizedPortfolios[portfolio], "Portfolio not authorized");
        _;
    }

    function authorizePortfolio(address portfolio, bool status) external onlyOwner {
        authorizedPortfolios[portfolio] = status;
        emit PortfolioAuthorized(portfolio, status);
    }

    function setRebalanceInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 1 hours, "Interval too short");
        rebalanceInterval = newInterval;
        emit IntervalUpdated(newInterval);
    }

    function setGasThreshold(uint256 newThreshold) external onlyOwner {
        gasThreshold = newThreshold;
        emit GasThresholdUpdated(newThreshold);
    }

    function checkAndRebalance(address portfolio) external onlyAuthorizedPortfolio(portfolio) whenNotPaused {
        require(block.timestamp >= portfolioLastRebalance[portfolio] + rebalanceInterval, "Too soon to rebalance");
        require(tx.gasprice <= gasThreshold, "Gas price too high");
        
        if (IPortfolio(portfolio).needsRebalancing()) {
            IPortfolio(portfolio).rebalance();
            portfolioLastRebalance[portfolio] = block.timestamp;
            emit RebalanceTriggered(portfolio, block.timestamp);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

 
