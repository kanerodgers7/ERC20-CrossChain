import { ethers } from "hardhat";
import { expect } from "chai";

describe("PSToken", function () {
  let customToken: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let feeAddress: any;

  beforeEach(async function () {
    const CustomTokenFactory = await ethers.getContractFactory("PSToken");
    [owner, addr1, addr2, feeAddress] = await ethers.getSigners();

    customToken = await CustomTokenFactory.deploy(
      "PSToken",
      "PST-AMZ",
      feeAddress.address
    );
    return {customToken, owner, addr1, addr2, feeAddress}
  });

  it("Should mint tokens correctly", async function () {
    await customToken.mint(addr1.address, 1000);
    expect(await customToken.balanceOf(addr1.address)).to.equal(1000);
  });

  it("Should burn tokens correctly", async function () {
    await customToken.mint(addr1.address, 1000);
    await customToken.connect(addr1).burn(500);
    expect(await customToken.balanceOf(addr1.address)).to.equal(500);
  });

  it("Should transfer tokens with fee", async function () {
    await customToken.mint(addr1.address, 10000);
    await customToken.connect(addr1).transfer(addr2.address, 5000);
    const fee = (5000 * 1) / 1000; // 0.1% fee
    expect(await customToken.balanceOf(addr2.address)).to.equal(5000 - fee);
    expect(await customToken.accumulatedFees()).to.equal(fee);
  });

  it("Should transfer tokens without fee for owner", async function () {
    await customToken.mint(owner.address, 1000);
    await customToken.transfer(addr2.address, 500);
    expect(await customToken.balanceOf(addr2.address)).to.equal(500);
    expect(await customToken.accumulatedFees()).to.equal(0);
  });

  it("Should harvest fees correctly", async function () {
    await customToken.mint(addr1.address, 10000);
    await customToken.connect(addr1).transfer(addr2.address, 5000);
    const fee = (5000 * 1) / 1000; // 0.1% fee
    await customToken.harvestFees();
    expect(await customToken.balanceOf(feeAddress.address)).to.equal(fee);
    expect(await customToken.accumulatedFees()).to.equal(0);
  });

  it("Should set fee address correctly", async function () {
    await customToken.setFeeAddress(addr1.address);
    expect(await customToken.feeAddress()).to.equal(addr1.address);
  });

  it("Should set fee percentage correctly", async function () {
    await customToken.setFeePercentage(2);
    expect(await customToken.feePercentage()).to.equal(2);
  });

  it("Should return the correct token balance of an address", async function () {
    await customToken.mint(addr1.address, 1000);
    const balance = await customToken.getTokenBalance(addr1.address);
    expect(balance).to.equal(1000);
    expect
  });
  
});