// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPortfolio {
    function rebalance(uint[] memory balances) external;
}

contract AutoBalancer {
    function triggerRebalance(address portfolio, uint[] memory currentBalances) external {
        IPortfolio(portfolio).rebalance(currentBalances);
    }
}

 
