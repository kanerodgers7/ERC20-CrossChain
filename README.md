# Profit Share Token (PST) development details

This page provides general information about the PST contract and required files around the contract. All contract source codes can be found under the contracts folder.

## Contracts overview

The following are the main contract features:

- `Symbol`: A unique token symbol (e.g. PST-AMZ).
- `Minting`: Ability to mint new tokens, restricted to the contract owner or an Admin role.
- `Burning`: Ability to burn tokens, available to the contract owner, Admin, and any token holder.
- `Transfer`: Standard ERC-20 transfer functionality, with a default fee applied.
  Option to transfer tokens without incurring the fee, restricted to owner.
- `Approve/TransferFrom`: Allow third parties to transfer tokens on behalf of the token holder, with the fee applied.
- `Fee Mechanism`: A percentage fee is collected on each transfer and transferFrom, sent to the contract address.
- `Set Fee Address`: The contract allows setting and changing the address that collects the fees, restricted to owner/Admin.
- `Set Fee Percentage`: Allows changing the fee percentage (0.1% of every transaction for default), restricted to owner/Admin.
- `Harvest`: Only owner can trigger transactions and the accumulated fee is transferred to fee address.

## Requirements

- Node.js (v20.0.0 or later)
- npm (v10.0.0 or later)

## Installation and Setup

1. Clone the repository
2. Install packages:
   ```
   npm i
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values (see Environment Variables section below)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

- `PRIVATE_KEY`: The private key of the account used for deployment and owner operations. You can generate it by running `node utils/generateKey.js`.
- `AMOY_API_KEY`: API key for the [Polygon Amoy testnet block explorer](https://amoy.polygonscan.com/) (for contract verification).
- `ETHERSCAN_API_KEY`: API key for [Etherscan](https://etherscan.io/) (for contract verification on Ethereum and some compatible networks).

Example:

```
PRIVATE_KEY=0x1234...  # Your actual private key here, including the '0x' prefix
AMOY_API_KEY=ABC123...  # Your Amoy block explorer API key
ETHERSCAN_API_KEY=XYZ789...  # Your Etherscan API key
```

## Development

To start development on the project, follow these steps:

1. Compile contracts:

   ```
   npx hardhat compile
   ```

2. Run unit tests:

   ```
   npm run test
   ```

3. Run e2e tests on a local network:

   ```
   npm run test:e2e
   ```

4. Run e2e tests on a specific network (make sure that you provide 4 pre-funded addresses in pst.e2e):
   ```
   npm run test:e2e --network [network]
   ```

## Deployment

A sample deployment script has been created. It deploys the contract and also verifies it on the respective block explorer. Make sure that your account has enough native coin (0.1 POL for Polygon) to facilitate the deployment. You can run the script by following these steps:

1. Ensure your `.env` file is set up correctly with the necessary environment variables.

2. Run the deployment script:
   ```
   npx hardhat run scripts/deploy.ts --network [network]
   ```

Available networks:

- `base-amoy`: This is for Polygon Amoy testnet
- `base-polygon`: This is for Polygon mainnet
- `sepolia`: This is for Ethereum Sepolia testnet
- `base-ethereum`: This is for Ethereum mainnet
- `base-binance`: This is for Binance Smart Chain mainnet
- `base-local`: For local development network

Example output for Polygon Amoy `npx hardhat run scripts/deploy.ts --network base-amoy`:

```
Deploying contracts with the account: 0xe03127a97339CC340B2fC00D48f610ACB56Dd915
Account balance: 1000000000000000000
CustomToken deployed to: 0xDA129F82C16ce472c9A43E8f9657988675159d88
```

## Verification

After deployment, verify the contract on the respective block explorer:

1. Create Polygon scan API KEY (update .env file if not already done)

2. Run the verification script:
   ```
   npx hardhat verify --network [network] <deployed_address> "PSToken" "PST-AMZ" <fee_address> <decimal_number> <max_supply>
   ```

Five input parameters are required:

- Token Name
- Token Symbol
- Fee Address
- Decimal Number
- Maximum Supply

Example:

```
npx hardhat verify --network base-amoy 0xF8bb0a8fd3A54b5B35Cc9E75214eD851C923E9E5 "PSToken" "PST-AMZ" "0x65b20c217a1f1D66885Fb1dd33CDf664B0510D5f" 18 100000
```

## Latest Deployment

The latest test deployment to Amoy network is [here](https://amoy.polygonscan.com/address/0x37e7756A59b930BFAbBb7c9508B3944D962E27b8)

## Admin Functionality

The contract owner (deployer) has admin privileges, including:

- Minting new tokens
- Setting the fee address
- Adjusting the fee percentage
- Performing fee-free transfers
- Harvesting accumulated fees

## Security Considerations

- Keep private keys and API keys secure. Never commit them to version control.
- For production deployments, use a hardware wallet or secure key management solution.
- Regularly monitor the contract for any suspicious activities.

## Cross-chain Compatibility

The PST token contract is designed to be deployable on multiple EVM-compatible chains (e.g. Ethereum, BSC). The Hardhat configuration includes settings for various networks, making it easy to deploy and test on different chains.
