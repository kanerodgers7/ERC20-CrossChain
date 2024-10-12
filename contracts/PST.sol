// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PSToken is ERC20, Ownable {
    uint256 public feeNominator = 1; // Default fee percentage (0.1%)
    uint256 public feeDenominator = 1000; // Default fee percentage (0.1%)
    address public feeAddress;
    uint256 public accumulatedFees;
    uint8 private _decimals;

    uint256 public MAX_SUPPLY;

    mapping(address => bool) private _isHolder;
    address[] private _holders;

    constructor(
        string memory name,
        string memory symbol,
        address _feeAddress,
        uint8 decimals_,
        uint256 _maxSupply
    ) ERC20(name, symbol) {
        feeAddress = _feeAddress;
        _decimals = decimals_ == 0 ? 18 : decimals_;
        MAX_SUPPLY = _maxSupply * 10 ** uint256(_decimals); // Set MAX_SUPPLY in the constructor
    }

    // Override the decimals function to return the custom value
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Minting would exceed max supply"
        );
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
            : (amount * feeNominator) / feeDenominator;
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
        require(
            allowance(from, _msgSender()) >= amount,
            "Insufficient allowance"
        );
        uint256 feeAmount = from == owner()
            ? 0
            : (amount * feeNominator) / feeDenominator;
        uint256 amountAfterFee = amount - feeAmount;
        _transfer(from, to, amountAfterFee);

        if (feeAmount > 0) {
            accumulatedFees += feeAmount; // Accumulate the fee in the contract
            _transfer(from, address(this), feeAmount);
        }
        _approve(from, _msgSender(), allowance(from, _msgSender()) - amount);
        return true;
    }

    function setFeeAddress(address _feeAddress) public onlyOwner {
        feeAddress = _feeAddress;
    }

    function setFeeFactor(
        uint256 _nominator,
        uint256 _denominator
    ) public onlyOwner {
        feeNominator = _nominator;
        feeDenominator = _denominator;
    }

    function harvestFees() public onlyOwner {
        require(accumulatedFees > 0, "No fees to harvest");
        _transfer(address(this), feeAddress, accumulatedFees);
        accumulatedFees = 0;
    }

    function transferFee(uint256 _amount) public view returns (uint256) {
        return _amount / (feeDenominator - feeNominator);
    }
    
    // Added to make it easy for our DEX to recognise PSTs
    function isPst() public pure returns (bool) {
        return true;
    }
}
