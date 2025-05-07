// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IERC20Extended is IERC20 {
    function decimals() external view returns (uint8);
}

contract Swap {
    using SafeERC20 for IERC20;

    event XTalkMessageBroadcasted(
        bytes message,
        string destinationNetwork,
        string destinationSmartContractAddress
    );

    function _l1xSend(
        address senderAddress,
        address recipientAddress, 
        address sourceTokenAddress, 
        address destinationTokenAddress, 
        uint256 sourceAmount, 
        uint256 destinationAmount, 
        string memory destinationSmartContractAddress, 
        string memory destinationNetwork
    ) external {
        // Convert the struct to bytes
        bytes memory messageBytes = abi.encode(
            senderAddress,
            recipientAddress,
            sourceAmount,
            destinationAmount,
            sourceTokenAddress,
            destinationTokenAddress
        );

        IERC20(sourceTokenAddress).safeTransferFrom(senderAddress,address(this), sourceAmount);
        emit XTalkMessageBroadcasted(messageBytes, destinationNetwork, destinationSmartContractAddress);
    }

    function _l1xReceive(bytes32 globalTxId, bytes memory message) external {
        (
            address recipientAddress, 
            uint256 destinationAmount,
            address destinationTokenAddress
        ) = abi.decode(message, (address, uint256, address));
        IERC20(destinationTokenAddress).safeTransfer(recipientAddress, destinationAmount);  
    }
}