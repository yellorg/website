import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import type { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";

interface TestContext {
  duckies: Contract;
  owner: SignerWithAddress;
  user: SignerWithAddress;
  referer: SignerWithAddress;
  others: SignerWithAddress[];
}

describe("Duckies", function () {
  beforeEach(async function () {
    const [owner, signer] = await ethers.getSigners();

    const Duckies = await ethers.getContractFactory("Duckies");
    const duckies = await upgrades.deployProxy(Duckies, [signer.address]);
    await duckies.deployed();
    this.duckies = duckies;

    this.owner = owner;
  });

  it("Should return the symbol", async function () {
    const { duckies }: TestContext = this as any;

    expect(await duckies.symbol()).to.equal("DUCKZ");
  });

  it("Should verify that totalSupply is 44400000000000000000000000000000", async function () {
    const { duckies }: TestContext = this as any;
    const [ref] = await ethers.getSigners();
    const balance = await duckies.balanceOf(ref.address);

    expect(balance).to.equal("44400000000000000000000000000000");
  });

  it("Should successfully get initial payouts and set payouts", async function () {
    const { duckies }: TestContext = this as any;

    expect(await duckies._payouts(0)).to.equal(500);
    expect(await duckies._payouts(1)).to.equal(125);
    expect(await duckies._payouts(2)).to.equal(80);
    expect(await duckies._payouts(3)).to.equal(50);
    expect(await duckies._payouts(4)).to.equal(20);

    await duckies.setPayouts([10, 20, 30, 40, 50]);
    expect(await duckies._payouts(0)).to.equal(10);
    expect(await duckies._payouts(1)).to.equal(20);
    expect(await duckies._payouts(2)).to.equal(30);
    expect(await duckies._payouts(3)).to.equal(40);
    expect(await duckies._payouts(4)).to.equal(50);
  });

  it("Should successfully convert message to hash", async function () {
    const { duckies }: TestContext = this as any;
    const [ref] = await ethers.getSigners();

    const message = {
      ref: ref.address,
      amt: 100,
    };

    expect(await duckies.getMessageHash(message)).to.equal(
      "0x7cf83b7b2c339e15c12e41e24d8520dcdbd1546198bfa357628822ca12c4f6f6"
    );
    expect(await duckies.getMessageHash(message)).to.have.length(66);
  });

  it("Should successfully convert messageHas to eth signed message hash", async function () {
    const { duckies }: TestContext = this as any;
    const [ref] = await ethers.getSigners();

    const message = {
      ref: ref.address,
      amt: 100,
    };
    const messageHash = await duckies.getMessageHash(message);

    expect(await duckies.getEthSignedMessageHash(messageHash)).to.be.equal(
      "0x9f5be0224a999fb70cd8f51cae4357b55f683d3f466d705dbe5b07516f80e87b"
    );
    expect(await duckies.getEthSignedMessageHash(messageHash)).to.have.length(
      66
    );
  });

  it("Should successfully recover signer of message", async function () {
    const { duckies }: TestContext = this as any;
    const [ref, signer] = await ethers.getSigners();
    const provider = ethers.provider;

    const message = {
      ref: ref.address,
      amt: 100,
    };
    const messageHash = await duckies.getMessageHash(message);
    const ethSignedMessageHash = await duckies.getEthSignedMessageHash(
      messageHash
    );
    const signerAccount = signer.address;
    const signature = await provider.send("personal_sign", [
      messageHash,
      signerAccount,
    ]);

    const recoverResult = await duckies.recover(
      ethSignedMessageHash,
      signature
    );

    expect(recoverResult).to.be.equal(signerAccount);
  });

  it("should successfully reward the caller and its refs", async function () {
    const { duckies }: TestContext = this as any;
    // eslint-disable-next-line no-unused-vars
    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;
    const payoutRefOne = await duckies._payouts(0);
    const payoutRefTwo = await duckies._payouts(1);
    const payoutRefThree = await duckies._payouts(2);
    const payoutRefFour = await duckies._payouts(3);
    const payoutRefFive = await duckies._payouts(4);

    // preparing message and signature for first account
    const messageAccountZero = {
      ref: accounts[0].address,
      amt: 30000,
    };
    const messageAccountZeroHash = await duckies.getMessageHash(
      messageAccountZero
    );
    const signatureAccountZero = await provider.send("personal_sign", [
      messageAccountZeroHash,
      signerAccount,
    ]);

    await duckies
      .connect(accounts[1])
      .reward(messageAccountZero, signatureAccountZero);
    const balanceAccountOneStageOne = await duckies.balanceOf(
      accounts[1].address
    );
    expect(balanceAccountOneStageOne).to.be.equal(
      String(messageAccountZero.amt)
    );

    const balanceAccountZeroStageOne = await duckies.balanceOf(
      accounts[0].address
    );
    expect(balanceAccountZeroStageOne).to.be.equal(
      String((messageAccountZero.amt * payoutRefOne) / 100)
    );

    // preparing message and signature for second account
    const messageAccountOne = {
      ref: accounts[1].address,
      amt: 20000,
    };
    const messageAccountOneHash = await duckies.getMessageHash(
      messageAccountOne
    );
    const signatureAccountOne = await provider.send("personal_sign", [
      messageAccountOneHash,
      signerAccount,
    ]);

    await duckies
      .connect(accounts[2])
      .reward(messageAccountOne, signatureAccountOne);
    const balanceAccountTwoStageTwo = await duckies.balanceOf(
      accounts[2].address
    );
    expect(balanceAccountTwoStageTwo).to.be.equal(
      String(messageAccountOne.amt)
    );

    const balanceAccountOneStageTwo = await duckies.balanceOf(
      accounts[1].address
    );
    expect(balanceAccountOneStageTwo).to.be.equal(
      String(
        +balanceAccountOneStageOne +
          (messageAccountOne.amt * payoutRefOne) / 100
      )
    );

    const balanceAccountZeroStageTwo = await duckies.balanceOf(
      accounts[0].address
    );
    expect(balanceAccountZeroStageTwo).to.be.equal(
      String(
        +balanceAccountZeroStageOne +
          (messageAccountOne.amt * payoutRefTwo) / 100
      )
    );

    // preparing message and signature for third account
    const messageAccountTwo = {
      ref: accounts[2].address,
      amt: 10000,
    };
    const messageAccountTwoHash = await duckies.getMessageHash(
      messageAccountTwo
    );
    const signatureAccountTwo = await provider.send("personal_sign", [
      messageAccountTwoHash,
      signerAccount,
    ]);

    await duckies
      .connect(accounts[3])
      .reward(messageAccountTwo, signatureAccountTwo);
    const balanceAccountThreeStageThree = await duckies.balanceOf(
      accounts[3].address
    );
    expect(balanceAccountThreeStageThree).to.be.equal(
      String(messageAccountTwo.amt)
    );

    const balanceAccountTwoStageThree = await duckies.balanceOf(
      accounts[2].address
    );
    expect(balanceAccountTwoStageThree).to.be.equal(
      String(
        +balanceAccountTwoStageTwo +
          (messageAccountTwo.amt * payoutRefOne) / 100
      )
    );

    const balanceAccountOneStageThree = await duckies.balanceOf(
      accounts[1].address
    );
    expect(balanceAccountOneStageThree).to.be.equal(
      String(
        +balanceAccountOneStageTwo +
          (messageAccountTwo.amt * payoutRefTwo) / 100
      )
    );

    const balanceAccountZeroStageThree = await duckies.balanceOf(
      accounts[0].address
    );
    expect(balanceAccountZeroStageThree).to.be.equal(
      String(
        +balanceAccountZeroStageTwo +
          (messageAccountTwo.amt * payoutRefThree) / 100
      )
    );

    // preparing message and signature for fourth account
    const messageAccountThree = {
      ref: accounts[3].address,
      amt: 5000,
    };
    const messageAccountThreeHash = await duckies.getMessageHash(
      messageAccountThree
    );
    const signatureAccountThree = await provider.send("personal_sign", [
      messageAccountThreeHash,
      signerAccount,
    ]);

    await duckies
      .connect(accounts[4])
      .reward(messageAccountThree, signatureAccountThree);
    const balanceAccountFourStageFour = await duckies.balanceOf(
      accounts[4].address
    );
    expect(balanceAccountFourStageFour).to.be.equal(
      String(messageAccountThree.amt)
    );

    const balanceAccountThreeStageFour = await duckies.balanceOf(
      accounts[3].address
    );
    expect(balanceAccountThreeStageFour).to.be.equal(
      String(
        +balanceAccountThreeStageThree +
          (messageAccountThree.amt * payoutRefOne) / 100
      )
    );

    const balanceAccountTwoStageFour = await duckies.balanceOf(
      accounts[2].address
    );
    expect(balanceAccountTwoStageFour).to.be.equal(
      String(
        +balanceAccountTwoStageThree +
          (messageAccountThree.amt * payoutRefTwo) / 100
      )
    );

    const balanceAccountOneStageFour = await duckies.balanceOf(
      accounts[1].address
    );
    expect(balanceAccountOneStageFour).to.be.equal(
      String(
        +balanceAccountOneStageThree +
          (messageAccountThree.amt * payoutRefThree) / 100
      )
    );

    const balanceAccountZeroStageFour = await duckies.balanceOf(
      accounts[0].address
    );
    expect(balanceAccountZeroStageFour).to.be.equal(
      String(
        +balanceAccountZeroStageThree +
          (messageAccountThree.amt * payoutRefFour) / 100
      )
    );

    // preparing message and signature for fifth account
    const messageAccountFour = {
      ref: accounts[4].address,
      amt: 5000,
    };
    const messageAccountFourHash = await duckies.getMessageHash(
      messageAccountFour
    );
    const signatureAccountFour = await provider.send("personal_sign", [
      messageAccountFourHash,
      signerAccount,
    ]);

    await duckies
      .connect(accounts[5])
      .reward(messageAccountFour, signatureAccountFour);
    const balanceAccountFifth = await duckies.balanceOf(accounts[5].address);
    expect(balanceAccountFifth).to.be.equal(String(messageAccountFour.amt));

    const balanceAccountFourStageFive = await duckies.balanceOf(
      accounts[4].address
    );
    expect(balanceAccountFourStageFive).to.be.equal(
      String(
        +balanceAccountFourStageFour +
          (messageAccountFour.amt * payoutRefOne) / 100
      )
    );

    const balanceAccountThreeStageFive = await duckies.balanceOf(
      accounts[3].address
    );
    expect(balanceAccountThreeStageFive).to.be.equal(
      String(
        +balanceAccountThreeStageFour +
          (messageAccountFour.amt * payoutRefTwo) / 100
      )
    );

    const balanceAccountTwoStageFive = await duckies.balanceOf(
      accounts[2].address
    );
    expect(balanceAccountTwoStageFive).to.be.equal(
      String(
        +balanceAccountTwoStageFour +
          (messageAccountFour.amt * payoutRefThree) / 100
      )
    );

    const balanceAccountOneStageFive = await duckies.balanceOf(
      accounts[1].address
    );
    expect(balanceAccountOneStageFive).to.be.equal(
      String(
        +balanceAccountOneStageFour +
          (messageAccountFour.amt * payoutRefFour) / 100
      )
    );

    const balanceAccountZeroStageFive = await duckies.balanceOf(
      accounts[0].address
    );
    expect(balanceAccountZeroStageFive).to.be.equal(
      String(
        +balanceAccountZeroStageFour +
          (messageAccountFour.amt * payoutRefFive) / 100
      )
    );
  });
});
