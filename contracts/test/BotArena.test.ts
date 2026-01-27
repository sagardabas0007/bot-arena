import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BotArena", function () {
  let botArena: any;
  let mockUSDC: any;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let player3: SignerWithAddress;
  let players: SignerWithAddress[];

  const ENTRY_FEE_1 = 100000n;   // $0.10 (Arena 1)
  const ENTRY_FEE_3 = 1000000n;  // $1.00 (Arena 3)
  const MINT_AMOUNT = 100000000n; // $100 USDC
  const MAX_BOTS = 10;

  beforeEach(async function () {
    [owner, player1, player2, player3, ...players] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy();
    await mockUSDC.waitForDeployment();

    // Deploy BotArena
    const BotArenaFactory = await ethers.getContractFactory("BotArena");
    botArena = await BotArenaFactory.deploy(await mockUSDC.getAddress());
    await botArena.waitForDeployment();

    // Mint USDC to all potential players and approve BotArena
    const allPlayers = [player1, player2, player3, ...players.slice(0, 10)];
    const botArenaAddress = await botArena.getAddress();

    for (const player of allPlayers) {
      await mockUSDC.mint(player.address, MINT_AMOUNT);
      await mockUSDC.connect(player).approve(botArenaAddress, MINT_AMOUNT);
    }
  });

  describe("Deployment", function () {
    it("should set the correct USDC address", async function () {
      expect(await botArena.usdc()).to.equal(await mockUSDC.getAddress());
    });

    it("should create 5 arenas", async function () {
      expect(await botArena.arenaCount()).to.equal(5n);
    });

    it("should set the deployer as owner", async function () {
      expect(await botArena.owner()).to.equal(owner.address);
    });

    it("should create arenas with correct entry fees", async function () {
      const expectedFees = [100000n, 500000n, 1000000n, 5000000n, 10000000n];
      for (let i = 0; i < expectedFees.length; i++) {
        const arena = await botArena.getArena(i + 1);
        expect(arena.entryFee).to.equal(expectedFees[i]);
      }
    });

    it("should mark all default arenas as active", async function () {
      for (let i = 1; i <= 5; i++) {
        const arena = await botArena.getArena(i);
        expect(arena.isActive).to.equal(true);
      }
    });

    it("should revert if deployed with zero USDC address", async function () {
      const BotArenaFactory = await ethers.getContractFactory("BotArena");
      await expect(
        BotArenaFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid USDC address");
    });
  });

  describe("Arena", function () {
    it("should return correct arena data", async function () {
      const arena = await botArena.getArena(1);
      expect(arena.id).to.equal(1n);
      expect(arena.entryFee).to.equal(ENTRY_FEE_1);
      expect(arena.isActive).to.equal(true);
    });

    it("should toggle arena active to inactive", async function () {
      await botArena.toggleArena(1, false);
      const arena = await botArena.getArena(1);
      expect(arena.isActive).to.equal(false);
    });

    it("should toggle arena inactive back to active", async function () {
      await botArena.toggleArena(1, false);
      await botArena.toggleArena(1, true);
      const arena = await botArena.getArena(1);
      expect(arena.isActive).to.equal(true);
    });

    it("should revert toggle if not owner", async function () {
      await expect(
        botArena.connect(player1).toggleArena(1, false)
      ).to.be.revertedWithCustomError(botArena, "OwnableUnauthorizedAccount");
    });

    it("should revert toggle for non-existent arena", async function () {
      await expect(
        botArena.toggleArena(99, false)
      ).to.be.revertedWith("Arena does not exist");
    });
  });

  describe("Game Creation", function () {
    it("should create a game for a valid arena", async function () {
      await botArena.createGame(1);
      expect(await botArena.gameCount()).to.equal(1n);
    });

    it("should create multiple games", async function () {
      await botArena.createGame(1);
      await botArena.createGame(2);
      await botArena.createGame(3);
      expect(await botArena.gameCount()).to.equal(3n);
    });

    it("should store the correct arenaId for the game", async function () {
      await botArena.createGame(3);
      const game = await botArena.games(1);
      expect(game.arenaId).to.equal(3n);
    });

    it("should fail for inactive arena", async function () {
      await botArena.toggleArena(1, false);
      await expect(botArena.createGame(1)).to.be.revertedWith("Arena not active");
    });

    it("should fail for non-existent arena", async function () {
      await expect(botArena.createGame(99)).to.be.revertedWith("Arena not active");
    });
  });

  describe("Joining Game", function () {
    let gameId: bigint;

    beforeEach(async function () {
      await botArena.createGame(3); // Arena 3: $1.00 entry fee
      gameId = await botArena.gameCount();
    });

    it("should allow a bot to join a game", async function () {
      await botArena.connect(player1).joinGame(gameId);
      const participants = await botArena.getGameParticipants(gameId);
      expect(participants.length).to.equal(1);
      expect(participants[0]).to.equal(player1.address);
    });

    it("should collect USDC from the joining player", async function () {
      const balanceBefore = await mockUSDC.balanceOf(player1.address);
      await botArena.connect(player1).joinGame(gameId);
      const balanceAfter = await mockUSDC.balanceOf(player1.address);
      expect(balanceBefore - balanceAfter).to.equal(ENTRY_FEE_3);
    });

    it("should increase the prize pool on join", async function () {
      await botArena.connect(player1).joinGame(gameId);
      const game = await botArena.games(gameId);
      expect(game.prizePool).to.equal(ENTRY_FEE_3);
    });

    it("should emit BotJoinedGame event", async function () {
      await expect(botArena.connect(player1).joinGame(gameId))
        .to.emit(botArena, "BotJoinedGame")
        .withArgs(gameId, player1.address, 1);
    });

    it("should allow multiple bots to join", async function () {
      await botArena.connect(player1).joinGame(gameId);
      await botArena.connect(player2).joinGame(gameId);
      await botArena.connect(player3).joinGame(gameId);

      const participants = await botArena.getGameParticipants(gameId);
      expect(participants.length).to.equal(3);
    });

    it("should fail if already joined", async function () {
      await botArena.connect(player1).joinGame(gameId);
      await expect(
        botArena.connect(player1).joinGame(gameId)
      ).to.be.revertedWith("Already joined");
    });

    it("should fail if game does not exist", async function () {
      await expect(
        botArena.connect(player1).joinGame(999)
      ).to.be.revertedWith("Game does not exist");
    });

    it("should fail if game is full (10 bots)", async function () {
      // Join with 10 different players
      const allPlayers = [player1, player2, player3, ...players.slice(0, 7)];
      for (let i = 0; i < MAX_BOTS; i++) {
        await botArena.connect(allPlayers[i]).joinGame(gameId);
      }

      // 11th player should fail
      const extraPlayer = players[7];
      await mockUSDC.mint(extraPlayer.address, MINT_AMOUNT);
      await mockUSDC.connect(extraPlayer).approve(await botArena.getAddress(), MINT_AMOUNT);
      await expect(
        botArena.connect(extraPlayer).joinGame(gameId)
      ).to.be.revertedWith("Game full");
    });

    it("should emit GameStarted when 10 bots join", async function () {
      const allPlayers = [player1, player2, player3, ...players.slice(0, 7)];
      for (let i = 0; i < MAX_BOTS - 1; i++) {
        await botArena.connect(allPlayers[i]).joinGame(gameId);
      }

      const expectedPrizePool = ENTRY_FEE_3 * BigInt(MAX_BOTS);
      await expect(botArena.connect(allPlayers[MAX_BOTS - 1]).joinGame(gameId))
        .to.emit(botArena, "GameStarted")
        .withArgs(gameId, expectedPrizePool);
    });

    it("should accumulate correct prize pool with all 10 bots", async function () {
      const allPlayers = [player1, player2, player3, ...players.slice(0, 7)];
      for (let i = 0; i < MAX_BOTS; i++) {
        await botArena.connect(allPlayers[i]).joinGame(gameId);
      }

      const game = await botArena.games(gameId);
      expect(game.prizePool).to.equal(ENTRY_FEE_3 * BigInt(MAX_BOTS));
    });

    it("should transfer correct total USDC to contract", async function () {
      const allPlayers = [player1, player2, player3, ...players.slice(0, 7)];
      for (let i = 0; i < MAX_BOTS; i++) {
        await botArena.connect(allPlayers[i]).joinGame(gameId);
      }

      const contractBalance = await mockUSDC.balanceOf(await botArena.getAddress());
      expect(contractBalance).to.equal(ENTRY_FEE_3 * BigInt(MAX_BOTS));
    });
  });

  describe("Game Completion", function () {
    let gameId: bigint;
    let allPlayers: SignerWithAddress[];

    beforeEach(async function () {
      await botArena.createGame(3); // Arena 3: $1.00 entry fee
      gameId = await botArena.gameCount();

      allPlayers = [player1, player2, player3, ...players.slice(0, 7)];
      for (let i = 0; i < MAX_BOTS; i++) {
        await botArena.connect(allPlayers[i]).joinGame(gameId);
      }
    });

    it("should set the winner correctly", async function () {
      await botArena.completeGame(gameId, player1.address);
      const game = await botArena.games(gameId);
      expect(game.winner).to.equal(player1.address);
    });

    it("should mark game as completed", async function () {
      await botArena.completeGame(gameId, player1.address);
      const game = await botArena.games(gameId);
      expect(game.isCompleted).to.equal(true);
    });

    it("should mark game as paid", async function () {
      await botArena.completeGame(gameId, player1.address);
      const game = await botArena.games(gameId);
      expect(game.isPaid).to.equal(true);
    });

    it("should transfer 90% of prize pool to winner", async function () {
      const prizePool = ENTRY_FEE_3 * BigInt(MAX_BOTS);
      const expectedWinnerPrize = (prizePool * 90n) / 100n;

      const balanceBefore = await mockUSDC.balanceOf(player1.address);
      await botArena.completeGame(gameId, player1.address);
      const balanceAfter = await mockUSDC.balanceOf(player1.address);

      expect(balanceAfter - balanceBefore).to.equal(expectedWinnerPrize);
    });

    it("should accumulate 10% as creator fee", async function () {
      const prizePool = ENTRY_FEE_3 * BigInt(MAX_BOTS);
      const expectedCreatorFee = (prizePool * 10n) / 100n;

      await botArena.completeGame(gameId, player1.address);
      expect(await botArena.totalFeesCollected()).to.equal(expectedCreatorFee);
    });

    it("should emit GameCompleted event with correct values", async function () {
      const prizePool = ENTRY_FEE_3 * BigInt(MAX_BOTS);
      const expectedWinnerPrize = (prizePool * 90n) / 100n;
      const expectedCreatorFee = (prizePool * 10n) / 100n;

      await expect(botArena.completeGame(gameId, player1.address))
        .to.emit(botArena, "GameCompleted")
        .withArgs(gameId, player1.address, expectedWinnerPrize, expectedCreatorFee);
    });

    it("should allow any participant to be the winner", async function () {
      // Use the last player as winner
      const lastPlayer = allPlayers[MAX_BOTS - 1];
      await botArena.completeGame(gameId, lastPlayer.address);
      const game = await botArena.games(gameId);
      expect(game.winner).to.equal(lastPlayer.address);
    });

    it("should fail if not called by owner", async function () {
      await expect(
        botArena.connect(player1).completeGame(gameId, player1.address)
      ).to.be.revertedWithCustomError(botArena, "OwnableUnauthorizedAccount");
    });

    it("should fail if winner is not a participant", async function () {
      const nonParticipant = players[8];
      await expect(
        botArena.completeGame(gameId, nonParticipant.address)
      ).to.be.revertedWith("Winner not in game");
    });

    it("should fail if game is already completed", async function () {
      await botArena.completeGame(gameId, player1.address);
      await expect(
        botArena.completeGame(gameId, player1.address)
      ).to.be.revertedWith("Game already completed");
    });

    it("should fail if game is not full", async function () {
      await botArena.createGame(3);
      const newGameId = await botArena.gameCount();
      await botArena.connect(player1).joinGame(newGameId);

      await expect(
        botArena.completeGame(newGameId, player1.address)
      ).to.be.revertedWith("Game not full");
    });

    it("should retain creator fee in contract balance", async function () {
      const prizePool = ENTRY_FEE_3 * BigInt(MAX_BOTS);
      const expectedCreatorFee = (prizePool * 10n) / 100n;

      await botArena.completeGame(gameId, player1.address);

      const contractBalance = await mockUSDC.balanceOf(await botArena.getAddress());
      expect(contractBalance).to.equal(expectedCreatorFee);
    });
  });

  describe("Fee Withdrawal", function () {
    let gameId: bigint;

    beforeEach(async function () {
      // Complete a game to generate fees
      await botArena.createGame(3);
      gameId = await botArena.gameCount();

      const allPlayers = [player1, player2, player3, ...players.slice(0, 7)];
      for (let i = 0; i < MAX_BOTS; i++) {
        await botArena.connect(allPlayers[i]).joinGame(gameId);
      }
      await botArena.completeGame(gameId, player1.address);
    });

    it("should allow owner to withdraw accumulated fees", async function () {
      const prizePool = ENTRY_FEE_3 * BigInt(MAX_BOTS);
      const expectedFees = (prizePool * 10n) / 100n;

      const balanceBefore = await mockUSDC.balanceOf(owner.address);
      await botArena.withdrawCreatorFees();
      const balanceAfter = await mockUSDC.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(expectedFees);
    });

    it("should reset totalFeesCollected to zero after withdrawal", async function () {
      await botArena.withdrawCreatorFees();
      expect(await botArena.totalFeesCollected()).to.equal(0n);
    });

    it("should empty the contract balance after withdrawal", async function () {
      await botArena.withdrawCreatorFees();
      const contractBalance = await mockUSDC.balanceOf(await botArena.getAddress());
      expect(contractBalance).to.equal(0n);
    });

    it("should fail if no fees to withdraw", async function () {
      await botArena.withdrawCreatorFees();
      await expect(botArena.withdrawCreatorFees()).to.be.revertedWith(
        "No fees to withdraw"
      );
    });

    it("should fail if not called by owner", async function () {
      await expect(
        botArena.connect(player1).withdrawCreatorFees()
      ).to.be.revertedWithCustomError(botArena, "OwnableUnauthorizedAccount");
    });

    it("should accumulate fees from multiple games", async function () {
      // Complete a second game
      await botArena.createGame(3);
      const gameId2 = await botArena.gameCount();

      const allPlayers = [player1, player2, player3, ...players.slice(0, 7)];
      for (let i = 0; i < MAX_BOTS; i++) {
        await mockUSDC.mint(allPlayers[i].address, MINT_AMOUNT);
        await mockUSDC.connect(allPlayers[i]).approve(await botArena.getAddress(), MINT_AMOUNT);
        await botArena.connect(allPlayers[i]).joinGame(gameId2);
      }
      await botArena.completeGame(gameId2, player2.address);

      const prizePool = ENTRY_FEE_3 * BigInt(MAX_BOTS);
      const expectedTotalFees = ((prizePool * 10n) / 100n) * 2n;

      expect(await botArena.totalFeesCollected()).to.equal(expectedTotalFees);
    });
  });

  describe("View Functions", function () {
    it("should return game participants", async function () {
      await botArena.createGame(1);
      const gameId = await botArena.gameCount();

      await botArena.connect(player1).joinGame(gameId);
      await botArena.connect(player2).joinGame(gameId);

      const participants = await botArena.getGameParticipants(gameId);
      expect(participants.length).to.equal(2);
      expect(participants[0]).to.equal(player1.address);
      expect(participants[1]).to.equal(player2.address);
    });

    it("should return empty array for new game", async function () {
      await botArena.createGame(1);
      const gameId = await botArena.gameCount();
      const participants = await botArena.getGameParticipants(gameId);
      expect(participants.length).to.equal(0);
    });

    it("should return correct constants", async function () {
      expect(await botArena.MAX_BOTS_PER_GAME()).to.equal(10n);
      expect(await botArena.CREATOR_FEE_PERCENT()).to.equal(10n);
      expect(await botArena.WINNER_PERCENT()).to.equal(90n);
    });

    it("should track gameCount correctly", async function () {
      expect(await botArena.gameCount()).to.equal(0n);
      await botArena.createGame(1);
      expect(await botArena.gameCount()).to.equal(1n);
      await botArena.createGame(2);
      expect(await botArena.gameCount()).to.equal(2n);
    });
  });
});
