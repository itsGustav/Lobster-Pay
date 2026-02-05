import { ethers } from "hardhat";

// Base Mainnet USDC
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
// Pay Lobster wallet (arbiter for disputes)
const ARBITER = "0xf775f0224A680E2915a066e53A389d0335318b7B";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🦞 Pay Lobster Contract Deployment");
  console.log("===================================");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: Base Mainnet`);
  console.log("");

  // Deploy Escrow
  console.log("Deploying PayLobsterEscrow...");
  const Escrow = await ethers.getContractFactory("PayLobsterEscrow");
  const escrow = await Escrow.deploy(USDC_BASE, ARBITER);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`✅ PayLobsterEscrow deployed: ${escrowAddress}`);

  // Deploy Registry
  console.log("\nDeploying PayLobsterRegistry...");
  const Registry = await ethers.getContractFactory("PayLobsterRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ PayLobsterRegistry deployed: ${registryAddress}`);

  console.log("\n===================================");
  console.log("🦞 Deployment Complete!");
  console.log("");
  console.log("Contract Addresses:");
  console.log(`  Escrow:   ${escrowAddress}`);
  console.log(`  Registry: ${registryAddress}`);
  console.log("");
  console.log("Verify on BaseScan:");
  console.log(`  npx hardhat verify --network base ${escrowAddress} ${USDC_BASE} ${ARBITER}`);
  console.log(`  npx hardhat verify --network base ${registryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
