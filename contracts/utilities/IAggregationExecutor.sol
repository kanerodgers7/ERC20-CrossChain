// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAggregationExecutor {
  function callBytes(bytes calldata data) external payable; // 0xd9c45357

/// @notice propagates information about original msg.sender and executes arbitrary data
    function execute(address msgSender) external payable returns(uint256);  // 0x4b64e492

  // callbytes per swap sequence
  function swapSingleSequence(bytes calldata data) external;

  function finalTransactionProcessing(
    address tokenIn,
    address tokenOut,
    address to,
    bytes calldata destTokenFeeData
  ) external;
}