import { ethers } from "hardhat";
import { expect } from "chai";
import { PSToken } from "../typechain-types"; // Adjust import path as necessary

describe("PSToken", function () {
  let customToken: PSToken;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let feeAddress: any;

  beforeEach(async function () {
    const CustomTokenFactory = await ethers.getContractFactory("PSToken");
    [owner, addr1, addr2, feeAddress] = await ethers.getSigners();

    //TODO: not sure how to fix this
    customToken = await CustomTokenFactory.deploy(
      "PSToken",
      "PST-AMZ",
      feeAddress.address,
      18,
      100000
    );
    return {customToken, owner, addr1, addr2, feeAddress}
  });

  it("Should have correct name and symbol and decimals", async function () {
    expect(await customToken.name()).to.equal("PSToken");
    expect(await customToken.symbol()).to.equal("PST-AMZ");
    expect(await customToken.decimals()).to.equal(18);
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

  it("Should set fee factor correctly", async function () {
    await customToken.setFeeFactor(2, 1000); // 0.2% fee
    expect(await customToken.feeNominator()).to.equal(2);
    expect(await customToken.feeDenominator()).to.equal(1000);
  });

  it("Should revert transferFrom when allowance is insufficient", async function () {
    await customToken.mint(owner.address, 1000);
    await customToken.approve(addr1.address, 500); // Approve 500 tokens for addr1
  
    await expect(
      customToken.connect(addr1).transferFrom(owner.address, addr2.address, 600)
    ).to.be.rejectedWith("VM Exception while processing transaction: reverted with reason string 'Insufficient allowance'");
  });

  it("Should revert when transferring more than balance", async function () {
    await expect(customToken.transfer(addr2.address, ethers.parseEther("1000000000")))
      .to.be.rejectedWith("ERC20: transfer amount exceeds balance");
  });
  it("Should revert transferFrom when allowance is insufficient", async function () {
    await customToken.mint(addr1.address, 1000);
    await customToken.connect(addr1).approve(addr2.address, 500);
    await expect(customToken.connect(addr2).transferFrom(addr1.address, addr2.address, 600))
      .to.be.rejectedWith("VM Exception while processing transaction: reverted with reason string 'Insufficient allowance'");
  });
  it("Should handle fee calculation correctly for very small transfers (given 0.1% fee, anything below 1000 incurs no fee)", async function () {
    await customToken.mint(addr1.address, 1000);
    await customToken.connect(addr1).transfer(addr2.address, 999);
    expect(await customToken.balanceOf(addr2.address)).to.equal(999);
    expect(await customToken.accumulatedFees()).to.equal(0);
  });
  it("Should allow only owner to mint tokens", async function () {
    await expect(customToken.connect(addr1).mint(addr1.address, 1000))
      .to.be.rejectedWith("Ownable: caller is not the owner");
  });
  it("Should calculate transfer fee correctly", async function () {
    const feeNominator = await customToken.feeNominator();
    const feeDenominator = await customToken.feeDenominator();

    const amount = ethers.parseEther("1000");
    const expectedFee = amount/(feeDenominator - feeNominator);

    const calculatedFee = await customToken.transferFee(amount);
    expect(calculatedFee).to.equal(expectedFee);
  });

  it("Should return zero fee for zero amount", async function () {
    const amount = ethers.parseEther("0");
    const expectedFee = ethers.parseEther("0");

    const calculatedFee = await customToken.transferFee(amount);
    expect(calculatedFee).to.equal(expectedFee);
  });

  // it("Should mint tokens and add to holders list", async function () {
  //   await customToken.mint(addr1.address, 1000);
  //   expect(await customToken.balanceOf(addr1.address)).to.equal(1000);

  //   const holders = await customToken.getHolders();
  //   expect(holders).to.include(addr1.address);
  // });

  // it("Should transfer tokens and update holders list", async function () {
  //   await customToken.mint(owner.address, 1000);
  //   await customToken.transfer(addr1.address, 500);
  //   await customToken.transfer(addr2.address, 500);

  //   const holders = await customToken.getHolders();
  //   expect(holders).to.include(addr1.address);
  //   expect(holders).to.include(addr2.address);
  // });

  // it("Should burn tokens and update holders list", async function () {
  //   await customToken.mint(addr1.address, 1000);
  //   await customToken.connect(addr1).burn(1000);

  //   const holders = await customToken.getHolders();
  //   expect(holders).to.not.include(addr1.address);
  // });

  it("Should have a maximum supply of tokens", async function () {
    const maxSupply = await customToken.MAX_SUPPLY();
    expect(maxSupply).to.equal(ethers.parseEther("100000"));
  });

  it("Should revert for minting over maximum supply", async function() {
    await expect(customToken.mint(owner.address, ethers.parseEther("100001")))
     .to.be.rejectedWith("Minting would exceed max supply");
  })

 });
