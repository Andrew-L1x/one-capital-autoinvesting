// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockL1XBridge {
    event BridgeAssetCalled(
        address fromToken,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    );

    function bridgeAsset(
        address fromToken,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external {
        // Transfer tokens from sender to bridge
        IERC20(fromToken).transferFrom(msg.sender, address(this), amount);
        
        emit BridgeAssetCalled(fromToken, amount, targetChainId, recipient);
    }
} 