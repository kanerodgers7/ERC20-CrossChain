const  {ethers}  = require("ethers");
const  dotenv = require("dotenv");
dotenv.config();

async function main() {
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USDT_ADDRESS = process.env.USDT_ADDRESS; //you have to store deployed USDT contract address in .env file
const PST_ADDRESS = process.env.PST_ADDRESS; ////you have to store deployed PST contract address in .env file

const usdtContract = require("../artifacts/contracts/USDT.sol/USDToken.json");
const pstContract = require("../artifacts/contracts/PST.sol/PSToken.json");

const amoyProvider = ethers.getDefaultProvider("https://polygon-amoy.drpc.org");
// const network = await amoyProvider.getNetwork();
// console.log("amoyProvider", network.chainId, network.name);

const managerAddress = "0xC4Bd2E416Db404CC63fcb506E94B7Ea6224473fd";
const managerhelperAddress = "0x430aE3E65e431FF405a0454Cf3e5291F21fB37f8";

const signer = new ethers.Wallet(String(PRIVATE_KEY), amoyProvider);
console.log ("signer address", signer.address)

const USDTContract = new ethers.Contract(USDT_ADDRESS, usdtContract.abi, signer);
const PSTContract = new ethers.Contract(PST_ADDRESS, pstContract.abi, signer);

try {
    //USDT Contract starting
    const usdtName = await USDTContract.name();
    console.log (usdtName)
    const usdtSymbol = await USDTContract.symbol();
    console.log (usdtSymbol)
    
    //mint USDT tokens
    const usdtBalance = await USDTContract.balanceOf(signer.address);
    console.log ("USDT balance before", usdtBalance);
    const mintAmount = BigInt(1000000000000000000000);
    const usdtMint = await USDTContract.mint(signer.address, mintAmount);
    await usdtMint.wait();
    const balance1 = await USDTContract.balanceOf(signer.address);
    console.log ("USDT balance after", balance1);

    //approve USDT token allowance to manager contract
    const usdtAllowance = await USDTContract.allowance(signer.address, managerAddress);
    console.log ("USDT allowance before", usdtAllowance);
    const usdtApprove = await USDTContract.approve(managerAddress, BigInt(1000000000000000000000));
    await usdtApprove.wait();
    const usdtAllowance1 = await USDTContract.allowance(signer.address, managerAddress);
    console.log ("USDT allowance after", usdtAllowance1);


    //PST Contract starting
    const pstName = await PSTContract.name();
    console.log (pstName);
    const pstSymbol = await PSTContract.symbol();
    console.log (pstSymbol);

    //mint PST tokens
    const pstBalance = await PSTContract.balanceOf(signer.address);
    console.log ("PST balance before", pstBalance);
    const pstMintAmount = BigInt(11000000000000000000000);
    const pstMint = await PSTContract.mint(signer.address, pstMintAmount);
    await pstMint.wait();
    const pstBalance1 = await PSTContract.balanceOf(signer.address);
    console.log ("PST balance after", pstBalance1);

    //approve PST token allowance to manager contract
    const pstAllowance = await PSTContract.allowance(signer.address, managerAddress);
    console.log ("PST allowance before", pstAllowance);
    const pstApprove = await PSTContract.approve(managerAddress, BigInt(11000000000000000000000));
    await pstApprove.wait();
    const pstAllowance1 = await PSTContract.allowance(signer.address, managerAddress);
    console.log ("PST allowance after", pstAllowance1);
} catch (error) {
    console.log(error)
}

}

main();