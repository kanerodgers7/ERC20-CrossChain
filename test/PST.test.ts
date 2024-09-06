import { ethers } from "hardhat";
import { expect } from "chai";

describe("CustomToken", function () {
  let customToken: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let feeAddress: any;

  beforeEach(async function () {
    const CustomTokenFactory = await ethers.getContractFactory("CustomToken");
    [owner, addr1, addr2, feeAddress] = await ethers.getSigners();

    customToken = await CustomTokenFactory.deploy(
      "CustomToken",
      "CTK",
      feeAddress.address
    );
    return {customToken, owner, addr1, addr2, feeAddress}
  });

  it("Should mint tokens to an address", async function () {
    await customToken.mint(addr1.address, 1000);
    expect(await customToken.balanceOf(addr1.address)).to.equal(1000);
  });

  it("Should burn tokens from an address", async function () {
    await customToken.mint(addr1.address, 1000);
    await customToken.connect(addr1).burn(500);
    expect(await customToken.balanceOf(addr1.address)).to.equal(500);
  });

  it("Should transfer tokens with default fee", async function () {
    await customToken.mint(owner.address, 1000);
    await customToken.transfer(addr1.address, 500);
    expect(await customToken.balanceOf(addr1.address)).to.equal(495); // Assuming 1% fee
    expect(await customToken.balanceOf(feeAddress.address)).to.equal(5); // Fee collected
  });

  it("Should transfer tokens with custom fee", async function () {
    await customToken.mint(owner.address, 1000);
    await customToken.setCustomFeePercentage(owner.address, 2); // Set custom fee to 2%
    await customToken.transfer(addr1.address, 500);
    expect(await customToken.balanceOf(addr1.address)).to.equal(490); // Assuming 2% fee
    expect(await customToken.balanceOf(feeAddress.address)).to.equal(10); // Fee collected
  });

  it("Should transfer tokens without fee by owner", async function () {
    await customToken.mint(owner.address, 1000);
    await customToken.transferWithoutFee(addr1.address, 500);
    expect(await customToken.balanceOf(addr1.address)).to.equal(500);
  });

  it("Should approve and transfer tokens from an address with default fee", async function () {
    await customToken.mint(owner.address, 1000);
    await customToken.approve(addr1.address, 500);
    await customToken.connect(addr1).transferFrom(owner.address, addr2.address, 500);
    expect(await customToken.balanceOf(addr2.address)).to.equal(495); // Assuming 1% fee
    expect(await customToken.balanceOf(feeAddress.address)).to.equal(5); // Fee collected
  });

  it("Should set fee address", async function () {
    await customToken.setFeeAddress(addr2.address);
    expect(await customToken.feeAddress()).to.equal(addr2.address);
  });

  it("Should set default fee percentage", async function () {
    await customToken.setDefaultFeePercentage(2);
    expect(await customToken.defaultFeePercentage()).to.equal(2);
  });

  it("Should set custom fee percentage", async function () {
    await customToken.setCustomFeePercentage(addr1.address, 2);
    expect(await customToken.customFeePercentages(addr1.address)).to.equal(2);
  });
});