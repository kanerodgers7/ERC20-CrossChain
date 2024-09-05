// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/security/Pausable.sol";
import "@1inch/solidity-utils/contracts/libraries/UniERC20.sol";
import "./EthReceiver.sol";
import "./IAggregationExecutor.sol";
import "./RouterErrors.sol";


contract GenericRouter is Pausable, EthReceiver {
    using UniERC20 for IERC20;
    using SafeERC20 for IERC20;

    error ZeroMinReturn();
    
    uint256 private constant _PARTIAL_FILL = 1 << 0;
    uint256 private constant _REQUIRES_EXTRA_ETH = 1 << 1;
    uint256 private constant _USE_PERMIT2 = 1 << 2;

    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
    }
    
    /**
    * @notice Performs a swap, delegating all calls encoded in `data` to `executor`. See tests for usage examples.
    * @dev Router keeps 1 wei of every token on the contract balance for gas optimisations reasons.
    *      This affects first swap of every token by leaving 1 wei on the contract.
    * @param executor Aggregation executor that executes calls described in `data`.
    * @param desc Swap description.
    * @param data Encoded calls that `caller` should execute in between of swaps.
    * @return returnAmount Resulting token amount.
    * @return spentAmount Source token amount.
    */
   
    function swap(
        IAggregationExecutor executor,
        SwapDescription calldata desc,
        bytes calldata data
    )
        external
        payable
        whenNotPaused()
        returns (
            uint256 returnAmount,
            uint256 spentAmount
        )
    {
        if (desc.minReturnAmount == 0) revert ZeroMinReturn();

        IERC20 srcToken = desc.srcToken;
        IERC20 dstToken = desc.dstToken;

        bool srcETH = srcToken.isETH();
        if (desc.flags & _REQUIRES_EXTRA_ETH != 0) {
            if (msg.value <= (srcETH ? desc.amount : 0)) revert RouterErrors.InvalidMsgValue();
        } else {
            if (msg.value != (srcETH ? desc.amount : 0)) revert RouterErrors.InvalidMsgValue();
        }
        if (!srcETH) {
            srcToken.safeTransferFromUniversal(msg.sender, desc.srcReceiver, desc.amount, desc.flags & _USE_PERMIT2 != 0);
        }

        returnAmount = _execute(executor, msg.sender, desc.amount, data);
        spentAmount = desc.amount;

        if (desc.flags & _PARTIAL_FILL != 0) {
            uint256 unspentAmount = srcToken.uniBalanceOf(address(this));
            if (unspentAmount > 1) {
                // we leave 1 wei on the router for gas optimisations reasons
                unchecked { unspentAmount--; }
                spentAmount -= unspentAmount;
                srcToken.uniTransfer(payable(msg.sender), unspentAmount);
            }
            if (returnAmount * desc.amount < desc.minReturnAmount * spentAmount) revert RouterErrors.ReturnAmountIsNotEnough(returnAmount, desc.minReturnAmount * spentAmount / desc.amount);
        } else {
            if (returnAmount < desc.minReturnAmount) revert RouterErrors.ReturnAmountIsNotEnough(returnAmount, desc.minReturnAmount);
        }

        address payable dstReceiver = (desc.dstReceiver == address(0)) ? payable(msg.sender) : desc.dstReceiver;
        dstToken.uniTransfer(dstReceiver, returnAmount);
    }

    function _execute(
        IAggregationExecutor executor,
        address srcTokenOwner,
        uint256 inputAmount,
        bytes calldata data
    ) private returns(uint256 result) {
        bytes4 executeSelector = executor.execute.selector;
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            mstore(ptr, executeSelector)
            mstore(add(ptr, 0x04), srcTokenOwner)
            calldatacopy(add(ptr, 0x24), data.offset, data.length)
            mstore(add(add(ptr, 0x24), data.length), inputAmount)

            if iszero(call(gas(), executor, callvalue(), ptr, add(0x44, data.length), 0, 0x20)) {
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }

            result := mload(0)
        }
    }
}