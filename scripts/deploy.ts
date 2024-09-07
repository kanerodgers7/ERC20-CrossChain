import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  const CustomTokenFactory = await ethers.getContractFactory("PSToken");
  const customToken = await CustomTokenFactory.deploy("PSToken", "PST-AMZ", deployer.address);

  await customToken.waitForDeployment();
  console.log("CustomToken deployed to:", customToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
