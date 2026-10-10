// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ArcTipJar
/// @notice Non-custodial native USDC tip jar on Circle's Arc L1 (Chain ID 5042).
///         On Arc, the native gas asset IS USDC (18 decimals).
///         Tips are transferred directly to recipients with on-chain memos.
contract ArcTipJar {
    event Tip(
        address indexed from,
        address indexed to,
        uint256 amount,
        string memo,
        uint256 timestamp
    );

    mapping(address => uint256) public totalReceived;
    mapping(address => uint256) public tipCount;
    uint256 public totalTips;

    /// @notice Tip `to` some native USDC with an optional memo. Value flows directly to `to`.
    /// @param to The recipient wallet address.
    /// @param memo A public memo attached to the tip (max 280 characters).
    function tip(address payable to, string calldata memo) external payable {
        require(msg.value > 0, "ArcTipJar: tip must be > 0");
        require(to != address(0), "ArcTipJar: no zero address");
        require(bytes(memo).length <= 280, "ArcTipJar: memo too long");

        totalReceived[to] += msg.value;
        tipCount[to] += 1;
        totalTips += 1;

        (bool ok, ) = to.call{value: msg.value}("");
        require(ok, "ArcTipJar: transfer failed");

        emit Tip(msg.sender, to, msg.value, memo, block.timestamp);
    }
}
