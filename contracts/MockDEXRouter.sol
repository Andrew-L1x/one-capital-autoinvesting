// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockDEXRouter {
    // Mock price impact (0.1%)
    uint256 constant PRICE_IMPACT = 1;
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "Deadline passed");
        require(path.length == 2, "Only direct swaps supported");
        require(amountIn > 0, "Amount in must be positive");
        
        // Calculate amount out with price impact
        uint amountOut = (amountIn * (1000 - PRICE_IMPACT)) / 1000;
        require(amountOut >= amountOutMin, "Slippage too high");
        
        // Transfer tokens
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        IERC20(path[1]).transfer(to, amountOut);
        
        // Return amounts array
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
        
        return amounts;
    }
} 