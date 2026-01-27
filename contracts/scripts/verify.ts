import { run, ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface ContractInfo {
  address: string;
  constructorArgs: unknown[];
}

interface DeploymentInfo {
  contracts: {
    BotArena: ContractInfo;
    PrizePool: ContractInfo;
  };
  network: {
    name: string;
    chainId: number;
  };
}

async function verifyContract(
  name: string,
  address: string,
  constructorArguments: unknown[]
): Promise<void> {
  console.log(`\nVerifying ${name} at ${address}...`);
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
    console.log(`${name} verified successfully!`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.toLowerCase().includes("already verified")) {
      console.log(`${name} is already verified.`);
    } else {
      console.error(`Failed to verify ${name}:`, errorMessage);
      throw error;
    }
  }
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("Bot Arena - Contract Verification");
  console.log("=".repeat(60));

  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  console.log(`Network: ${network.name} (chainId: ${chainId})`);

  // Try to load deployment info from file
  const deploymentFile = path.join(
    __dirname,
    "..",
    "deployments",
    `deployment-${chainId}.json`
  );

  let deploymentInfo: DeploymentInfo;

  if (fs.existsSync(deploymentFile)) {
    console.log(`Loading deployment info from: ${deploymentFile}`);
    const raw = fs.readFileSync(deploymentFile, "utf-8");
    deploymentInfo = JSON.parse(raw) as DeploymentInfo;
  } else {
    // Fall back to environment variables
    const botArenaAddress = process.env.BOT_ARENA_ADDRESS;
    const prizePoolAddress = process.env.PRIZE_POOL_ADDRESS;
    const usdcAddress = process.env.USDC_ADDRESS;

    if (!botArenaAddress) {
      throw new Error(
        "No deployment file found and BOT_ARENA_ADDRESS not set. " +
          "Please deploy first or set BOT_ARENA_ADDRESS in .env"
      );
    }

    if (!usdcAddress) {
      throw new Error("USDC_ADDRESS not set in environment variables");
    }

    deploymentInfo = {
      contracts: {
        BotArena: {
          address: botArenaAddress,
          constructorArgs: [usdcAddress],
        },
        PrizePool: {
          address: prizePoolAddress || "",
          constructorArgs: [usdcAddress],
        },
      },
      network: {
        name: network.name,
        chainId,
      },
    };
  }

  // Verify BotArena
  const botArena = deploymentInfo.contracts.BotArena;
  await verifyContract("BotArena", botArena.address, botArena.constructorArgs);

  // Verify PrizePool (if deployed)
  const prizePool = deploymentInfo.contracts.PrizePool;
  if (prizePool.address && prizePool.address !== "") {
    await verifyContract(
      "PrizePool",
      prizePool.address,
      prizePool.constructorArgs
    );
  } else {
    console.log("\nSkipping PrizePool verification (no address found).");
  }

  console.log("\n" + "=".repeat(60));
  console.log("Verification complete!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
