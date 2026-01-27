import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("Bot Arena - Contract Deployment");
  console.log("=".repeat(60));
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer ETH balance:", ethers.formatEther(balance));

  const usdcAddress = process.env.USDC_ADDRESS;
  if (!usdcAddress) {
    throw new Error("USDC_ADDRESS not set in environment variables");
  }
  console.log("USDC address:", usdcAddress);
  console.log("-".repeat(60));

  // Deploy BotArena
  console.log("\nDeploying BotArena...");
  const BotArena = await ethers.getContractFactory("BotArena");
  const botArena = await BotArena.deploy(usdcAddress);
  await botArena.waitForDeployment();

  const botArenaAddress = await botArena.getAddress();
  console.log("BotArena deployed to:", botArenaAddress);

  // Deploy PrizePool
  console.log("\nDeploying PrizePool...");
  const PrizePool = await ethers.getContractFactory("PrizePool");
  const prizePool = await PrizePool.deploy(usdcAddress);
  await prizePool.waitForDeployment();

  const prizePoolAddress = await prizePool.getAddress();
  console.log("PrizePool deployed to:", prizePoolAddress);

  // Link PrizePool to BotArena
  console.log("\nSetting BotArena contract on PrizePool...");
  const setTx = await prizePool.setBotArenaContract(botArenaAddress);
  await setTx.wait();
  console.log("PrizePool linked to BotArena");

  // Verify arenas were created
  console.log("\n" + "-".repeat(60));
  console.log("Verifying arena creation...");

  const arenaCount = await botArena.arenaCount();
  console.log("Total arenas created:", arenaCount.toString());

  const expectedFees = [100000, 500000, 1000000, 5000000, 10000000];
  const feeLabels = ["$0.10", "$0.50", "$1.00", "$5.00", "$10.00"];

  for (let i = 1; i <= 5; i++) {
    const arena = await botArena.getArena(i);
    const feeMatch = arena.entryFee.toString() === expectedFees[i - 1].toString();
    console.log(
      `  Arena ${i}: entry fee = ${arena.entryFee.toString()} (${feeLabels[i - 1]}) | active = ${arena.isActive} | ${feeMatch ? "OK" : "MISMATCH"}`
    );
  }

  if (arenaCount.toString() !== "5") {
    throw new Error(`Expected 5 arenas, got ${arenaCount.toString()}`);
  }
  console.log("All 5 arenas verified successfully!");

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: Number(network.chainId),
    },
    deployer: deployer.address,
    contracts: {
      BotArena: {
        address: botArenaAddress,
        constructorArgs: [usdcAddress],
      },
      PrizePool: {
        address: prizePoolAddress,
        constructorArgs: [usdcAddress],
      },
    },
    usdcAddress: usdcAddress,
    arenaCount: Number(arenaCount),
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `deployment-${Number(network.chainId)}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  console.log("\n" + "=".repeat(60));
  console.log("Deployment complete!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
