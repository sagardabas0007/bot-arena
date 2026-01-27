// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrizePool
 * @notice Holds USDC prize funds for Bot Arena games and handles prize distribution.
 * @dev This contract acts as an escrow for game prizes. The BotArena contract or
 *      the owner can trigger prize distributions to winners.
 */
contract PrizePool is Ownable, ReentrancyGuard {
    IERC20 public usdc;

    /// @notice Address of the BotArena contract authorized to distribute prizes.
    address public botArenaContract;

    /// @notice Total amount of USDC that has been distributed as prizes.
    uint256 public totalDistributed;

    /// @notice Total amount of USDC currently deposited into the pool.
    uint256 public totalDeposited;

    /// @notice Tracks individual prize amounts won by each address.
    mapping(address => uint256) public winnings;

    event PrizeDeposited(address indexed depositor, uint256 amount);
    event PrizeDistributed(address indexed winner, uint256 amount, uint256 gameId);
    event BotArenaContractUpdated(address indexed oldAddress, address indexed newAddress);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    /**
     * @notice Restricts function access to the BotArena contract or the owner.
     */
    modifier onlyAuthorized() {
        require(
            msg.sender == botArenaContract || msg.sender == owner(),
            "Not authorized: caller is not BotArena or owner"
        );
        _;
    }

    /**
     * @notice Deploys the PrizePool contract.
     * @param _usdcAddress The address of the USDC token contract.
     */
    constructor(address _usdcAddress) Ownable(msg.sender) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdc = IERC20(_usdcAddress);
    }

    /**
     * @notice Sets the authorized BotArena contract address.
     * @param _botArenaContract The address of the BotArena contract.
     */
    function setBotArenaContract(address _botArenaContract) external onlyOwner {
        require(_botArenaContract != address(0), "Invalid BotArena address");
        address oldAddress = botArenaContract;
        botArenaContract = _botArenaContract;
        emit BotArenaContractUpdated(oldAddress, _botArenaContract);
    }

    /**
     * @notice Deposits USDC into the prize pool.
     * @dev Caller must have approved this contract to spend the specified amount.
     * @param _amount The amount of USDC to deposit (6 decimals).
     */
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(usdc.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");

        totalDeposited += _amount;
        emit PrizeDeposited(msg.sender, _amount);
    }

    /**
     * @notice Distributes a prize to the winner of a specific game.
     * @dev Only callable by the BotArena contract or the owner.
     * @param _winner The address of the game winner.
     * @param _amount The prize amount in USDC (6 decimals).
     * @param _gameId The ID of the completed game.
     */
    function distributePrize(
        address _winner,
        uint256 _amount,
        uint256 _gameId
    ) external onlyAuthorized nonReentrant {
        require(_winner != address(0), "Invalid winner address");
        require(_amount > 0, "Amount must be greater than 0");
        require(usdc.balanceOf(address(this)) >= _amount, "Insufficient pool balance");

        winnings[_winner] += _amount;
        totalDistributed += _amount;

        require(usdc.transfer(_winner, _amount), "Prize transfer failed");

        emit PrizeDistributed(_winner, _amount, _gameId);
    }

    /**
     * @notice Returns the current USDC balance held by this contract.
     * @return The USDC balance of the prize pool.
     */
    function getPoolBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    /**
     * @notice Returns the total winnings for a specific address.
     * @param _winner The address to query.
     * @return The total amount won by the address.
     */
    function getWinnings(address _winner) external view returns (uint256) {
        return winnings[_winner];
    }

    /**
     * @notice Emergency withdrawal of all USDC from the prize pool.
     * @dev Only callable by the contract owner. Use only in emergencies.
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");

        require(usdc.transfer(owner(), balance), "Emergency transfer failed");

        emit EmergencyWithdrawal(owner(), balance);
    }

    /**
     * @notice Emergency withdrawal of a specific ERC20 token (not USDC).
     * @dev Safety function to recover tokens accidentally sent to this contract.
     * @param _token The address of the ERC20 token to recover.
     */
    function emergencyWithdrawToken(address _token) external onlyOwner nonReentrant {
        require(_token != address(0), "Invalid token address");
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No token balance");
        require(token.transfer(owner(), balance), "Token transfer failed");
    }
}
