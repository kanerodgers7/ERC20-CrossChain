const  {ethers}  = require("ethers");
const  dotenv = require("dotenv");
dotenv.config();

async function main() {
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; //you have to store deployed contract address in .env file

const contract = require("../artifacts/contracts/USDT.sol/USDToken.json");

const amoyProvider = ethers.getDefaultProvider("https://polygon-amoy.drpc.org");
// const network = await amoyProvider.getNetwork();
// console.log("amoyProvider", network.chainId, network.name);

const signer = new ethers.Wallet(String(PRIVATE_KEY), amoyProvider);
console.log ("signer address", signer.address)

const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

try {
    const name = await tokenContract.name();
    console.log (name)
    const symbol = await tokenContract.symbol();
    console.log (symbol)
    // const allowance = await tokenContract.allowance("0xd6d54B39B8dC6a8593bD3470E583D88338055f45", "0xC4Bd2E416Db404CC63fcb506E94B7Ea6224473fd");
    // console.log ("allowance", allowance);
    const balance = await tokenContract.balanceOf("0x9A0b5006A8013166F659d2356e403483Ebf3A83B");
    console.log ("balance", balance);
    const mintAmount = BigInt(100000000000000000000);
    const mint = await tokenContract.mint("0x9A0b5006A8013166F659d2356e403483Ebf3A83B", mintAmount);
    await mint.wait();
    const balance1 = await tokenContract.balanceOf("0x9A0b5006A8013166F659d2356e403483Ebf3A83B");
    console.log ("balance_after", balance1);
} catch (error) {
    console.log(error)
}

}

main();