// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice A mock USDC token for testing purposes only.
 * @dev Mimics USDC with 6 decimal places. Anyone can mint tokens.
 *      DO NOT deploy this to mainnet.
 */
contract MockUSDC is ERC20 {
    uint8 private constant DECIMALS = 6;

    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mints tokens to a specified address. Open for testing.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint (6 decimals).
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
