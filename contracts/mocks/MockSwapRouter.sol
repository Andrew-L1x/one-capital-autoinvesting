// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockSwapRouter {
    uint256 private _priceImpact;

    function setPriceImpact(uint256 priceImpact_) external {
        _priceImpact = priceImpact_;
    }

    function getAmountsOut(uint256 amountIn, address[] memory path)
        external
        view
        returns (uint256[] memory amounts)
    {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        // Simulate price impact
        uint256 amountOut = (amountIn * (10000 - _priceImpact)) / 10000;
        amounts[1] = amountOut;
        
        return amounts;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "Deadline expired");
        
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        
        uint256 amountOut = (amountIn * (10000 - _priceImpact)) / 10000;
        require(amountOut >= amountOutMin, "Insufficient output amount");
        
        IERC20(path[1]).transfer(to, amountOut);
        
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
        
        return amounts;
    }
} 