import { ethers } from "hardhat";
require("dotenv").config();


async function main() {
  const [deployer] = await ethers.getSigners();
  const usdtName = process.env.USDT_NAME || "USDToken";
  const usdtSymbol = process.env.USDT_SYMBOL || "USDT";
  const pstName = process.env.PST_NAME || "PSToken";
  const pstSymbol = process.env.PST_SYMBOL || "PST";
  const feeAddress = process.env.FEE_ADDRESS || deployer.address;
  const tokenDecimal = process.env.TOKEN_DECIMAL || 18;
  const maxSupply = process.env.MAX_SUPPLY || 100000;
  
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  const USDTFactory = await ethers.getContractFactory("USDToken");
  const usdtToken = await USDTFactory.deploy(usdtName, usdtSymbol);

  await usdtToken.waitForDeployment();
  console.log("USDT Token deployed to:", usdtToken.target);

  const PSTFactory = await ethers.getContractFactory("PSToken");
  const pstToken = await PSTFactory.deploy(pstName, pstSymbol, feeAddress, tokenDecimal, maxSupply);

  await pstToken.waitForDeployment();
  console.log("PST Token deployed to:", pstToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
