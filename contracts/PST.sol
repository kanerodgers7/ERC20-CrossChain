// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    uint256 public defaultFeePercentage = 1; // Default fee percentage (1%)
    address public feeAddress;
    mapping(address => uint256) public customFeePercentages;

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
        uint256 feePercentage = _getFeePercentage(_msgSender());
        uint256 feeAmount = (amount * feePercentage) / 100;
        uint256 amountAfterFee = amount - feeAmount;
        _transfer(_msgSender(), to, amountAfterFee);
        _transfer(_msgSender(), feeAddress, feeAmount); // Transfer the fee to the fee address
        return true;
    }

    function transferWithoutFee(
        address to,
        uint256 amount
    ) public onlyOwner returns (bool) {
        _transfer(_msgSender(), to, amount);
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
        uint256 feePercentage = _getFeePercentage(from);
        uint256 feeAmount = (amount * feePercentage) / 100;
        uint256 amountAfterFee = amount - feeAmount;
        _transfer(from, to, amountAfterFee);
        _transfer(from, feeAddress, feeAmount); // Transfer the fee to the fee address
        _approve(from, _msgSender(), allowance(from, _msgSender()) - amount);
        return true;
    }

    function setFeeAddress(address _feeAddress) public onlyOwner {
        feeAddress = _feeAddress;
    }

    function setDefaultFeePercentage(uint256 _feePercentage) public onlyOwner {
        defaultFeePercentage = _feePercentage;
    }

    function setCustomFeePercentage(
        address account,
        uint256 _feePercentage
    ) public onlyOwner {
        customFeePercentages[account] = _feePercentage;
    }

    function _getFeePercentage(address account) private view returns (uint256) {
        return
            customFeePercentages[account] > 0
                ? customFeePercentages[account]
                : defaultFeePercentage;
    }
}
