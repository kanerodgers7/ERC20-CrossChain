const { HardhatUserConfig, vars } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const config = {
  solidity: {
    version: "0.8.24",
  },
  networks: {
    "base-polygon": {
      url: "https://polygon.drpc.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    // for mainnet binance
    "base-binance": {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    // for testnet
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: [process.env.PRIVATE_KEY],
      gas: 8000000,
      gasPrice: 1000000000,
    },
    // for local dev environment
    "base-local": {
      url: "http://localhost:8545",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    //for polygon Amoy
    "base-amoy": {
      url: "https://polygon-amoy.drpc.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
  ignition: {
    root: "./src/ignition",
    modules: "./modules",
    output: "./output",
    clean: true,
  },
  defaultNetwork: "hardhat",
};

module.exports = config;
