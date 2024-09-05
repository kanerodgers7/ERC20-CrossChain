// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./utilities/IAggregationRouterV6.sol";
import "./utilities/IAggregationExecutor.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {TransferHelper} from "./utilities/TransferHelper.sol";

contract Trident is FlashLoanSimpleReceiverBase {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    GenericRouter public immutable aggregationRouterV6 =
        GenericRouter(payable(0x111111125421cA6dc452d289314280a0f8842A65));
    address public immutable aggregationExecutor =
        0x5F515F6C524B18cA30f7783Fb58Dd4bE2e9904EC;

    address payable public owner;

    struct SwapData {
        uint256 amount;
        address[] exchRoute;
        bytes[] txData;
    }

    constructor(
        IPoolAddressesProvider _addressProvider
    ) FlashLoanSimpleReceiverBase(_addressProvider) {
        owner = payable(msg.sender); // Set the contract owner to the creator of this contract.
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        SwapData memory data = abi.decode(params, (SwapData));
        uint256 acquiredAmt = amount;

        // Trade 1: Swap base for first token to trade
        acquiredAmt = _place_swapv6(
            acquiredAmt,
            [address(asset), data.exchRoute[0]],
            1, // Set the minimum amount out to 0 for the first swap
            data.txData[0] // Pass the txData for the first swap, converted to calldata
        );
        console.log("First swap done");

        // Loop through the token path and perform swaps
        for (uint i = 1; i < data.exchRoute.length - 1; i++) {
            acquiredAmt = _place_swapv6(
                acquiredAmt,
                [data.exchRoute[i - 1], data.exchRoute[i]],
                0, // Set the minimum amount out to 0 for intermediate swaps
                data.txData[i] // Pass the txData for each swap, converted to calldata
            );
            console.log("Another swap done");
        }

        // Final Swap: Swap the last token for the base token
        acquiredAmt = _place_swapv6(
            acquiredAmt,
            [data.exchRoute[data.exchRoute.length - 1], address(asset)],
            0, // Set the minimum amount out to 0 for the final swap
            data.txData[data.exchRoute.length - 1] // Pass the txData for the final swap, converted to calldata
        );
        console.log("Last swap done");

        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);
        return true;
    }

    function requestFlashLoan(
        address _token,
        uint256 _amount,
        address[] calldata _exchRoute,
        bytes[] calldata _txData
    ) external {
        bytes memory swapData = abi.encode(
            SwapData({amount: _amount, exchRoute: _exchRoute, txData: _txData})
        );

        POOL.flashLoanSimple(address(this), _token, _amount, swapData, 0);
    }

    function getBalance(address _tokenAddress) internal view {
        uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
        console.log(
            "Balance of token at address ",
            Strings.toHexString(uint160(_tokenAddress), 20),
            ": ",
            balance
        );
    }

    function withdraw(address _tokenAddress) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }
    function _place_swapv6(
        uint256 _amountIn,
        address[2] memory _tokenPath,
        uint256 _minAmountOut,
        bytes memory _data // This is the ABI-encoded calldata for `swap`
    ) private returns (uint256 returnAmount) {
        // Initialize approval
        TransferHelper.safeApprove(
            _tokenPath[0],
            address(aggregationRouterV6),
            _amountIn
        );
        GenericRouter.SwapDescription memory desc = GenericRouter
            .SwapDescription({
                srcToken: IERC20(_tokenPath[0]),
                dstToken: IERC20(_tokenPath[1]),
                srcReceiver: payable(aggregationExecutor),
                dstReceiver: payable(address(this)),
                amount: _amountIn,
                minReturnAmount: _minAmountOut,
                flags: 0
            });
        getBalance(_tokenPath[0]);
        // Execute the swap
        (returnAmount, ) = aggregationRouterV6.swap(
            IAggregationExecutor(aggregationExecutor),
            desc,
            _data
        );
        getBalance(_tokenPath[0]);
    }
    receive() external payable {}
}
