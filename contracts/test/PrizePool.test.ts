import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PrizePool", function () {
  let prizePool: any;
  let mockUSDC: any;
  let owner: SignerWithAddress;
  let botArenaContract: SignerWithAddress;
  let winner1: SignerWithAddress;
  let winner2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const MINT_AMOUNT = 100000000n; // $100 USDC
  const DEPOSIT_AMOUNT = 50000000n; // $50 USDC
  const PRIZE_AMOUNT = 9000000n;  // $9 USDC
  const GAME_ID = 1n;

  beforeEach(async function () {
    [owner, botArenaContract, winner1, winner2, unauthorized] =
      await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy();
    await mockUSDC.waitForDeployment();

    // Deploy PrizePool
    const PrizePoolFactory = await ethers.getContractFactory("PrizePool");
    prizePool = await PrizePoolFactory.deploy(await mockUSDC.getAddress());
    await prizePool.waitForDeployment();

    // Set BotArena contract address
    await prizePool.setBotArenaContract(botArenaContract.address);

    // Mint USDC to owner and approve PrizePool for deposits
    await mockUSDC.mint(owner.address, MINT_AMOUNT);
    await mockUSDC
      .connect(owner)
      .approve(await prizePool.getAddress(), MINT_AMOUNT);
  });

  describe("Deployment", function () {
    it("should set the correct USDC address", async function () {
      expect(await prizePool.usdc()).to.equal(await mockUSDC.getAddress());
    });

    it("should set the deployer as owner", async function () {
      expect(await prizePool.owner()).to.equal(owner.address);
    });

    it("should initialize totalDistributed to zero", async function () {
      expect(await prizePool.totalDistributed()).to.equal(0n);
    });

    it("should initialize totalDeposited to zero", async function () {
      expect(await prizePool.totalDeposited()).to.equal(0n);
    });

    it("should revert if deployed with zero USDC address", async function () {
      const PrizePoolFactory = await ethers.getContractFactory("PrizePool");
      await expect(
        PrizePoolFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid USDC address");
    });
  });

  describe("BotArena Contract Configuration", function () {
    it("should set the BotArena contract address", async function () {
      expect(await prizePool.botArenaContract()).to.equal(
        botArenaContract.address
      );
    });

    it("should emit BotArenaContractUpdated event", async function () {
      const newAddress = winner1.address;
      await expect(prizePool.setBotArenaContract(newAddress))
        .to.emit(prizePool, "BotArenaContractUpdated")
        .withArgs(botArenaContract.address, newAddress);
    });

    it("should allow updating the BotArena contract address", async function () {
      await prizePool.setBotArenaContract(winner1.address);
      expect(await prizePool.botArenaContract()).to.equal(winner1.address);
    });

    it("should revert if set by non-owner", async function () {
      await expect(
        prizePool
          .connect(unauthorized)
          .setBotArenaContract(unauthorized.address)
      ).to.be.revertedWithCustomError(prizePool, "OwnableUnauthorizedAccount");
    });

    it("should revert if set to zero address", async function () {
      await expect(
        prizePool.setBotArenaContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid BotArena address");
    });
  });

  describe("Deposit", function () {
    it("should accept USDC deposits", async function () {
      await prizePool.deposit(DEPOSIT_AMOUNT);
      expect(await prizePool.getPoolBalance()).to.equal(DEPOSIT_AMOUNT);
    });

    it("should update totalDeposited", async function () {
      await prizePool.deposit(DEPOSIT_AMOUNT);
      expect(await prizePool.totalDeposited()).to.equal(DEPOSIT_AMOUNT);
    });

    it("should emit PrizeDeposited event", async function () {
      await expect(prizePool.deposit(DEPOSIT_AMOUNT))
        .to.emit(prizePool, "PrizeDeposited")
        .withArgs(owner.address, DEPOSIT_AMOUNT);
    });

    it("should revert if amount is zero", async function () {
      await expect(prizePool.deposit(0n)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
    });

    it("should accept multiple deposits", async function () {
      const halfDeposit = DEPOSIT_AMOUNT / 2n;
      await prizePool.deposit(halfDeposit);
      await prizePool.deposit(halfDeposit);
      expect(await prizePool.totalDeposited()).to.equal(DEPOSIT_AMOUNT);
    });

    it("should accept deposits from any address", async function () {
      await mockUSDC.mint(winner1.address, MINT_AMOUNT);
      await mockUSDC.connect(winner1).approve(await prizePool.getAddress(), MINT_AMOUNT);

      await prizePool.connect(winner1).deposit(DEPOSIT_AMOUNT);
      expect(await prizePool.getPoolBalance()).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Prize Distribution", function () {
    beforeEach(async function () {
      // Deposit funds into pool
      await prizePool.deposit(DEPOSIT_AMOUNT);
    });

    it("should distribute prize to winner (called by owner)", async function () {
      const balanceBefore = await mockUSDC.balanceOf(winner1.address);
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, GAME_ID);
      const balanceAfter = await mockUSDC.balanceOf(winner1.address);

      expect(balanceAfter - balanceBefore).to.equal(PRIZE_AMOUNT);
    });

    it("should distribute prize to winner (called by BotArena contract)", async function () {
      const balanceBefore = await mockUSDC.balanceOf(winner1.address);
      await prizePool
        .connect(botArenaContract)
        .distributePrize(winner1.address, PRIZE_AMOUNT, GAME_ID);
      const balanceAfter = await mockUSDC.balanceOf(winner1.address);

      expect(balanceAfter - balanceBefore).to.equal(PRIZE_AMOUNT);
    });

    it("should update totalDistributed", async function () {
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, GAME_ID);
      expect(await prizePool.totalDistributed()).to.equal(PRIZE_AMOUNT);
    });

    it("should track individual winnings", async function () {
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, GAME_ID);
      expect(await prizePool.getWinnings(winner1.address)).to.equal(
        PRIZE_AMOUNT
      );
    });

    it("should accumulate winnings for same winner across games", async function () {
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, 1n);
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, 2n);
      expect(await prizePool.getWinnings(winner1.address)).to.equal(
        PRIZE_AMOUNT * 2n
      );
    });

    it("should emit PrizeDistributed event", async function () {
      await expect(
        prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, GAME_ID)
      )
        .to.emit(prizePool, "PrizeDistributed")
        .withArgs(winner1.address, PRIZE_AMOUNT, GAME_ID);
    });

    it("should reduce pool balance after distribution", async function () {
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, GAME_ID);
      expect(await prizePool.getPoolBalance()).to.equal(
        DEPOSIT_AMOUNT - PRIZE_AMOUNT
      );
    });

    it("should revert if called by unauthorized address", async function () {
      await expect(
        prizePool
          .connect(unauthorized)
          .distributePrize(winner1.address, PRIZE_AMOUNT, GAME_ID)
      ).to.be.revertedWith("Not authorized: caller is not BotArena or owner");
    });

    it("should revert if winner is zero address", async function () {
      await expect(
        prizePool.distributePrize(ethers.ZeroAddress, PRIZE_AMOUNT, GAME_ID)
      ).to.be.revertedWith("Invalid winner address");
    });

    it("should revert if amount is zero", async function () {
      await expect(
        prizePool.distributePrize(winner1.address, 0n, GAME_ID)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("should revert if insufficient pool balance", async function () {
      const tooMuch = DEPOSIT_AMOUNT + 1n;
      await expect(
        prizePool.distributePrize(winner1.address, tooMuch, GAME_ID)
      ).to.be.revertedWith("Insufficient pool balance");
    });

    it("should distribute prizes to multiple winners", async function () {
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, 1n);
      await prizePool.distributePrize(winner2.address, PRIZE_AMOUNT, 2n);

      expect(await prizePool.getWinnings(winner1.address)).to.equal(
        PRIZE_AMOUNT
      );
      expect(await prizePool.getWinnings(winner2.address)).to.equal(
        PRIZE_AMOUNT
      );
      expect(await prizePool.totalDistributed()).to.equal(PRIZE_AMOUNT * 2n);
    });
  });

  describe("Emergency Withdrawal", function () {
    beforeEach(async function () {
      await prizePool.deposit(DEPOSIT_AMOUNT);
    });

    it("should allow owner to withdraw all USDC", async function () {
      const balanceBefore = await mockUSDC.balanceOf(owner.address);
      await prizePool.emergencyWithdraw();
      const balanceAfter = await mockUSDC.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(DEPOSIT_AMOUNT);
    });

    it("should empty the pool balance", async function () {
      await prizePool.emergencyWithdraw();
      expect(await prizePool.getPoolBalance()).to.equal(0n);
    });

    it("should emit EmergencyWithdrawal event", async function () {
      await expect(prizePool.emergencyWithdraw())
        .to.emit(prizePool, "EmergencyWithdrawal")
        .withArgs(owner.address, DEPOSIT_AMOUNT);
    });

    it("should revert if called by non-owner", async function () {
      await expect(
        prizePool.connect(unauthorized).emergencyWithdraw()
      ).to.be.revertedWithCustomError(prizePool, "OwnableUnauthorizedAccount");
    });

    it("should revert if no funds to withdraw", async function () {
      await prizePool.emergencyWithdraw();
      await expect(prizePool.emergencyWithdraw()).to.be.revertedWith(
        "No funds to withdraw"
      );
    });
  });

  describe("Emergency Token Withdrawal", function () {
    let otherToken: any;

    beforeEach(async function () {
      // Deploy another mock token to simulate accidental transfer
      const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
      otherToken = await MockUSDCFactory.deploy();
      await otherToken.waitForDeployment();

      // Mint and send other token to PrizePool
      await otherToken.mint(owner.address, MINT_AMOUNT);
      await otherToken
        .connect(owner)
        .transfer(await prizePool.getAddress(), MINT_AMOUNT);
    });

    it("should recover accidentally sent tokens", async function () {
      const balanceBefore = await otherToken.balanceOf(owner.address);
      await prizePool.emergencyWithdrawToken(await otherToken.getAddress());
      const balanceAfter = await otherToken.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(MINT_AMOUNT);
    });

    it("should revert if called by non-owner", async function () {
      await expect(
        prizePool
          .connect(unauthorized)
          .emergencyWithdrawToken(await otherToken.getAddress())
      ).to.be.revertedWithCustomError(prizePool, "OwnableUnauthorizedAccount");
    });

    it("should revert if token address is zero", async function () {
      await expect(
        prizePool.emergencyWithdrawToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid token address");
    });

    it("should revert if no token balance", async function () {
      // Deploy yet another token with no balance in PrizePool
      const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
      const emptyToken = await MockUSDCFactory.deploy();
      await emptyToken.waitForDeployment();

      await expect(
        prizePool.emergencyWithdrawToken(await emptyToken.getAddress())
      ).to.be.revertedWith("No token balance");
    });
  });

  describe("View Functions", function () {
    it("should return correct pool balance", async function () {
      expect(await prizePool.getPoolBalance()).to.equal(0n);
      await prizePool.deposit(DEPOSIT_AMOUNT);
      expect(await prizePool.getPoolBalance()).to.equal(DEPOSIT_AMOUNT);
    });

    it("should return zero winnings for address with no wins", async function () {
      expect(await prizePool.getWinnings(winner1.address)).to.equal(0n);
    });

    it("should return correct totalDistributed after multiple distributions", async function () {
      await prizePool.deposit(DEPOSIT_AMOUNT);
      await prizePool.distributePrize(winner1.address, PRIZE_AMOUNT, 1n);
      await prizePool.distributePrize(winner2.address, PRIZE_AMOUNT, 2n);
      expect(await prizePool.totalDistributed()).to.equal(PRIZE_AMOUNT * 2n);
    });
  });
});
