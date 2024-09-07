// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PSToken is ERC20, Ownable {
    uint256 public feePercentage = 1; // Default fee percentage (0.1%)
    address public feeAddress;
    uint256 public accumulatedFees;

    constructor(
        string memory name,
        string memory symbol,
        address _feeAddress
    ) ERC20(name, symbol) {
        feeAddress = _feeAddress;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        uint256 feeAmount = msg.sender == owner()
            ? 0
            : (amount * feePercentage) / 1000;
        uint256 amountAfterFee = amount - feeAmount;
        _transfer(_msgSender(), to, amountAfterFee);
        if (feeAmount > 0) {
            _transfer(_msgSender(), address(this), feeAmount);
            accumulatedFees += feeAmount; // Accumulate the fee in the contract
        }
        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        return super.approve(spender, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        uint256 feeAmount = from == owner()
            ? 0
            : (amount * feePercentage) / 1000;
        uint256 amountAfterFee = amount - feeAmount;
        _transfer(from, to, amountAfterFee);

        if (feeAmount > 0) {
            accumulatedFees += feeAmount; // Accumulate the fee in the contract
            _transfer(_msgSender(), address(this), feeAmount);
        }
        _approve(from, _msgSender(), allowance(from, _msgSender()) - amount);
        return true;
    }

    function setFeeAddress(address _feeAddress) public onlyOwner {
        feeAddress = _feeAddress;
    }

    function setFeePercentage(uint256 _feePercentage) public onlyOwner {
        feePercentage = _feePercentage;
    }

    function harvestFees() public onlyOwner {
        require(accumulatedFees > 0, "No fees to harvest");
        _transfer(address(this), feeAddress, accumulatedFees);
        accumulatedFees = 0;
    }

    function getContractBalance() public view returns (uint256) {
        return balanceOf(address(this));
    }

    function getTokenBalance(address account) public view returns (uint256) {
        return balanceOf(account);
    }
}
