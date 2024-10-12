import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { PSToken } from "../typechain-types"; // Adjust import path as necessary

describe("PSToken E2E Tests", function() {
  let pstToken: PSToken;
  let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress;


   before(async function() {
    // This line ensures we're using the correct network
    this.timeout(60000);

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const CustomToken = await ethers.getContractFactory("PSToken");
    pstToken = await CustomToken.deploy("PSToken", "PST", owner.address, 18, 100000);
    await pstToken.waitForDeployment();
    console.log("PSToken deployed to:", pstToken.target);
  });

  it("Should mint tokens correctly", async function() {
    this.timeout(60000);

    const tx = await pstToken.connect(owner).mint(owner.address, ethers.parseEther("1000"));
    await tx.wait();
    const tx0 = await pstToken.connect(owner).mint(addr1.address, ethers.parseEther("1000"));
    await tx0.wait();
    expect(await pstToken.balanceOf(owner.address)).to.equal(ethers.parseEther("1000"));
    expect(await pstToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));

    await expect(pstToken.connect(addr1).mint(addr1.address, ethers.parseEther("1000")))
      .to.be.rejectedWith("Ownable: caller is not the owner");
  });

  it("Should handle transfers correctly", async function() {
    this.timeout(60000);

    const tx = await pstToken.connect(addr1).transfer(addr2.address, ethers.parseEther("100"));
    await tx.wait();
    expect(await pstToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("99.9"));
    expect(await pstToken.accumulatedFees()).to.equal(ethers.parseEther("0.1"));

    const initialAddr2Balance = await pstToken.balanceOf(addr2.address);
    const tx0 = await pstToken.connect(owner).transfer(addr2.address, ethers.parseEther("100"));
    await tx0.wait();
    expect(await pstToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance + ethers.parseEther("100"));

  });

  it("Should burn tokens correctly", async function() {
    this.timeout(60000);

    const tx = await pstToken.connect(addr1).burn(ethers.parseEther("50"));
    await tx.wait();
    expect(await pstToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("850"));


    await expect(pstToken.connect(addr1).burn(ethers.parseEther("1000000")))
      .to.be.rejectedWith("ERC20: burn amount exceeds balance");
  });

  it("Should manage fees correctly", async function() {
    this.timeout(60000);

    const tx = await pstToken.connect(owner).setFeeFactor(2, 1000);
    await tx.wait();
    expect(await pstToken.feeNominator()).to.equal(2);
    expect(await pstToken.feeDenominator()).to.equal(1000);

    await expect(pstToken.connect(addr1).setFeeFactor(3, 1000))
      .to.be.rejectedWith("Ownable: caller is not the owner");

    const tx0 = await pstToken.connect(owner).setFeeAddress(addr3.address);
    await tx0.wait();
    expect(await pstToken.feeAddress()).to.equal(addr3.address);

    await expect(pstToken.connect(addr1).setFeeAddress(addr1.address))
      .to.be.rejectedWith("Ownable: caller is not the owner");
  });

  it("Should harvest fees correctly", async function() {
    this.timeout(60000);

    const tx = await pstToken.connect(addr1).transfer(addr2.address, ethers.parseEther("100"));
    await tx.wait();
    const tx0 = await pstToken.connect(addr2).transfer(addr1.address, ethers.parseEther("50"));
    await tx0.wait();
    const tx1 = await pstToken.connect(owner).harvestFees();
    await tx1.wait();
    expect(await pstToken.balanceOf(addr3.address)).to.equal(ethers.parseEther("0.4"));

    await expect(pstToken.connect(addr1).harvestFees())
      .to.be.rejectedWith("Ownable: caller is not the owner");
  });

  it("Should handle approvals and transferFrom correctly", async function() {
    this.timeout(60000);

    const tx = await pstToken.connect(addr1).approve(addr2.address, ethers.parseEther("100"));
    await tx.wait();
    const tx0 = await pstToken.connect(addr2).transferFrom(addr1.address, addr2.address, ethers.parseEther("50"));
    await tx0.wait();
    expect(await pstToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("299.6"));
    expect(await pstToken.accumulatedFees()).to.equal(ethers.parseEther("0.1"));

  });
});