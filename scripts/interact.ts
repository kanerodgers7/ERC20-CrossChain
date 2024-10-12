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

const signer = new ethers.Wallet(String(PRIVATE_KEY), amoyProvider);
console.log ("signer address", signer.address)

const USDTContract = new ethers.Contract(USDT_ADDRESS, usdtContract.abi, signer);
const PSTContract = new ethers.Contract(PST_ADDRESS, pstContract.abi, signer);

try {
    const usdtName = await USDTContract.name();
    console.log (usdtName)
    const usdtSymbol = await USDTContract.symbol();
    console.log (usdtSymbol)
    // const allowance = await tokenContract.allowance("0xd6d54B39B8dC6a8593bD3470E583D88338055f45", "0xC4Bd2E416Db404CC63fcb506E94B7Ea6224473fd");
    // console.log ("allowance", allowance);
    const balance = await USDTContract.balanceOf("0x9A0b5006A8013166F659d2356e403483Ebf3A83B");
    console.log ("balance", balance);
    const mintAmount = BigInt(100000000000000000000);
    const mint = await USDTContract.mint("0x9A0b5006A8013166F659d2356e403483Ebf3A83B", mintAmount);
    await mint.wait();
    const balance1 = await USDTContract.balanceOf("0x9A0b5006A8013166F659d2356e403483Ebf3A83B");
    console.log ("balance_after", balance1);

    const pstName = await PSTContract.name();
    console.log (pstName);
    const pstSymbol = await PSTContract.symbol();
    console.log (pstSymbol);
    const pstBalance = await PSTContract.balanceOf("0x9A0b5006A8013166F659d2356e403483Ebf3A83B");
    console.log ("pst_balance", pstBalance);
    const pstMintAmount = BigInt(10000000000000000000);
    const pstMint = await PSTContract.mint("0x9A0b5006A8013166F659d2356e403483Ebf3A83B", pstMintAmount);
    await pstMint.wait();
    const pstBalance1 = await PSTContract.balanceOf("0x9A0b5006A8013166F659d2356e403483Ebf3A83B");
    console.log ("pst_balance_after", pstBalance1);
} catch (error) {
    console.log(error)
}

}

main();