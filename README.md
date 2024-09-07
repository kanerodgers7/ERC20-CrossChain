# PST token development details

This page provides general information about the used contract and required files around the contract. All contract source codes can be found under the _src_ folder.

## Contracts overview

The following are the main contract features:

- `Symbol`: A unique token symbol.

- `Minting`: Ability to mint new tokens, restricted to the contract owner or an Admin role.
- `Burning`: Ability to burn tokens, available to the contract owner, Admin, and any token holder.
- `Transfer`: Standard ERC-20 transfer functionality, with a default fee applied.
  Option to transfer tokens without incurring the fee, restricted to owner.
- `Approve/TransferFrom`: Allow third parties to transfer tokens on behalf of the token holder, with the fee applied.
- `Fee Mechanism`: A percentage fee is collected on each transfer and transferFrom, sent to the contract address.
- `Set Fee Address`: The contract allows setting and changing the address that collects the fees, restricted to owner/Admin.
- `Set Fee Percentage`: Allows changing the fee percentage (0.1% of every transaction for default), restricted to owner/Admin.
- `Harvest`: Only owner can trigger transactions and the accumulated fee is transferred to fee address.

## Unit tests

The contracts are covered by unit tests. Both happy paths and unhappy
paths should be sufficiently covered.

You can run unit tests with Hardhat: `npx hardhat test`.

## Development

To start development on the project, you should do (at least) the following:

1. Install packages: `npm i`

1. Compile contracts: `npx hardhat compile`
1. Run unit tests: `npx hardhat test`

## Deployment

A sample deployment script has been created. It deploys all the contracts and also verifies them in Etherscan. You can run the script by following these steps:

1. Set up environment variables in a file called `.env`. There is an example of the settings in `.env.example`.
1. Run script with `npx hardhat run scripts/deploy.ts --network [network]`

   - base-amoy: This is for Polygon test Network
   - base-polygon: This is for Poygon main Network
   - sepolia: This is for Ethereum test Network
   - base-ethereum: This is for Ethereum main Network
   - base-binance: This is for Binance main Network

## Verification

- Create Polygon scan API KEY(update .env file) and run the script.

  **_`npx hardhat verify --network [network] deployed_address args`_**

  3input parameters are required:

        Token Name
        Token Symbol
        Fee Address

- here is example

  `npx hardhat verify --network base-amoy 0xf395df678de56fb50910cd79671c131f050775b8 "PSToken", "PST-AMZ", "0x65b20c217a1f1D66885Fb1dd33CDf664B0510D5f"`

## Latest Deployment

The latest test deployment to Amoy network is [here](https://amoy.polygonscan.com/address/0xf395df678de56fb50910cd79671c131f050775b8#readContract)
