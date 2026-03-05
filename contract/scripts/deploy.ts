import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy TestToken (optional — for ERC-20 testing)
  const deployTestToken = process.env.DEPLOY_TEST_TOKEN === "true";
  if (deployTestToken) {
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy();
    await testToken.waitForDeployment();
    const tokenAddress = await testToken.getAddress();
    console.log(`\nTestToken (tUSDC) deployed to: ${tokenAddress}`);
    console.log(`NEXT_PUBLIC_TEST_TOKEN_ADDRESS=${tokenAddress}`);
  }

  // Deploy OrganizationFactory
  const Factory = await ethers.getContractFactory("OrganizationFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`\nOrganizationFactory deployed to: ${factoryAddress}`);
  console.log(`\nAdd to frontend .env:`);
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
