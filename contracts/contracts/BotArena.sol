// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BotArena
 * @notice Core contract for the Bot Arena competitive AI bot racing game.
 * @dev 5 bots per arena, 3 elimination rounds, winner takes 90% of prize pool (USDC).
 *      Creator (contract owner) receives 10% as a platform fee.
 */
contract BotArena is Ownable, ReentrancyGuard {
    IERC20 public usdc;

    uint256 public constant MAX_BOTS_PER_GAME = 5;
    uint256 public constant CREATOR_FEE_PERCENT = 10;
    uint256 public constant WINNER_PERCENT = 90;

    struct Arena {
        uint256 id;
        uint256 entryFee;
        bool isActive;
    }

    struct GameSession {
        uint256 arenaId;
        uint256 prizePool;
        address[] participants;
        address winner;
        bool isCompleted;
        bool isPaid;
    }

    mapping(uint256 => Arena) public arenas;
    mapping(uint256 => GameSession) public games;

    uint256 public arenaCount;
    uint256 public gameCount;
    uint256 public totalFeesCollected;

    event ArenaCreated(uint256 indexed arenaId, uint256 entryFee);
    event BotJoinedGame(uint256 indexed gameId, address indexed bot, uint256 participantCount);
    event GameStarted(uint256 indexed gameId, uint256 prizePool);
    event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 winnerPrize, uint256 creatorFee);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);

    /**
     * @notice Deploys BotArena and creates 5 default arenas with preset entry fees.
     * @param _usdcAddress The address of the USDC token contract on Base.
     */
    constructor(address _usdcAddress) Ownable(msg.sender) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdc = IERC20(_usdcAddress);

        // Create default arenas with entry fees in USDC (6 decimals)
        _createArena(100000);   // $0.10
        _createArena(500000);   // $0.50
        _createArena(1000000);  // $1.00
        _createArena(5000000);  // $5.00
        _createArena(10000000); // $10.00
    }

    /**
     * @dev Internal function to create a new arena.
     * @param _entryFee The USDC entry fee for the arena (6 decimals).
     */
    function _createArena(uint256 _entryFee) private {
        arenaCount++;
        arenas[arenaCount] = Arena({
            id: arenaCount,
            entryFee: _entryFee,
            isActive: true
        });
        emit ArenaCreated(arenaCount, _entryFee);
    }

    /**
     * @notice Creates a new game session for a given arena.
     * @param _arenaId The ID of the arena to create a game for.
     * @return The newly created game ID.
     */
    function createGame(uint256 _arenaId) external returns (uint256) {
        require(arenas[_arenaId].isActive, "Arena not active");
        gameCount++;
        GameSession storage game = games[gameCount];
        game.arenaId = _arenaId;
        return gameCount;
    }

    /**
     * @notice Allows a bot (player) to join an existing game session.
     * @dev Transfers the arena entry fee in USDC from the caller to this contract.
     * @param _gameId The ID of the game to join.
     */
    function joinGame(uint256 _gameId) external nonReentrant {
        GameSession storage game = games[_gameId];
        require(game.arenaId != 0, "Game does not exist");
        require(!game.isCompleted, "Game already completed");
        require(game.participants.length < MAX_BOTS_PER_GAME, "Game full");

        // Check not already joined
        for (uint256 i = 0; i < game.participants.length; i++) {
            require(game.participants[i] != msg.sender, "Already joined");
        }

        Arena memory arena = arenas[game.arenaId];
        require(usdc.transferFrom(msg.sender, address(this), arena.entryFee), "USDC transfer failed");

        game.participants.push(msg.sender);
        game.prizePool += arena.entryFee;

        emit BotJoinedGame(_gameId, msg.sender, game.participants.length);

        if (game.participants.length == MAX_BOTS_PER_GAME) {
            emit GameStarted(_gameId, game.prizePool);
        }
    }

    /**
     * @notice Completes a game by declaring the winner and distributing prizes.
     * @dev Only callable by the contract owner (game server backend).
     *      Sends 90% of the prize pool to the winner and retains 10% as creator fee.
     * @param _gameId The ID of the game to complete.
     * @param _winner The address of the winning bot.
     */
    function completeGame(uint256 _gameId, address _winner) external onlyOwner nonReentrant {
        GameSession storage game = games[_gameId];
        require(!game.isCompleted, "Game already completed");
        require(game.participants.length == MAX_BOTS_PER_GAME, "Game not full");
        require(_isParticipant(_gameId, _winner), "Winner not in game");

        game.winner = _winner;
        game.isCompleted = true;

        uint256 creatorFee = (game.prizePool * CREATOR_FEE_PERCENT) / 100;
        uint256 winnerPrize = (game.prizePool * WINNER_PERCENT) / 100;

        totalFeesCollected += creatorFee;
        require(usdc.transfer(_winner, winnerPrize), "Winner transfer failed");
        game.isPaid = true;

        emit GameCompleted(_gameId, _winner, winnerPrize, creatorFee);
    }

    /**
     * @dev Checks if an address is a participant in a game.
     * @param _gameId The game ID to check.
     * @param _bot The address to look for.
     * @return True if the address is a participant.
     */
    function _isParticipant(uint256 _gameId, address _bot) private view returns (bool) {
        GameSession storage game = games[_gameId];
        for (uint256 i = 0; i < game.participants.length; i++) {
            if (game.participants[i] == _bot) return true;
        }
        return false;
    }

    /**
     * @notice Allows the owner to withdraw accumulated creator fees.
     */
    function withdrawCreatorFees() external onlyOwner nonReentrant {
        require(totalFeesCollected > 0, "No fees to withdraw");
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        require(usdc.transfer(owner(), amount), "Transfer failed");
    }

    /**
     * @notice Returns the list of participants for a given game.
     * @param _gameId The game ID to query.
     * @return An array of participant addresses.
     */
    function getGameParticipants(uint256 _gameId) external view returns (address[] memory) {
        return games[_gameId].participants;
    }

    /**
     * @notice Returns arena data for a given arena ID.
     * @param _arenaId The arena ID to query.
     * @return The Arena struct.
     */
    function getArena(uint256 _arenaId) external view returns (Arena memory) {
        return arenas[_arenaId];
    }

    /**
     * @notice Toggles an arena's active status.
     * @param _arenaId The arena ID to toggle.
     * @param _isActive The new active status.
     */
    function toggleArena(uint256 _arenaId, bool _isActive) external onlyOwner {
        require(arenas[_arenaId].id != 0, "Arena does not exist");
        arenas[_arenaId].isActive = _isActive;
    }
}
