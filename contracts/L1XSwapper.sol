// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDEXAggregator {
    function swap(address tokenIn, address tokenOut, uint amountIn, uint minAmountOut, address to) external returns (uint);
}

contract L1XSwapper {
    address public dex;

    constructor(address _dex) {
        dex = _dex;
    }

    function executeSwap(address tokenIn, address tokenOut, uint amountIn, uint minOut, address recipient) external returns (uint) {
        return IDEXAggregator(dex).swap(tokenIn, tokenOut, amountIn, minOut, recipient);
    }
}

 
