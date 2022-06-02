import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, assert } from "chai";
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

  it("Should verify that totalSupply is 444000000000", async function () {
    const { duckies }: TestContext = this as any;
    const [ref] = await ethers.getSigners();

    const balance = await duckies.balanceOf(ref.address);
    const decimals = await duckies.decimals();

    expect(decimals).to.be.equal(2);
    expect(balance).to.equal(444000000000 * 10 ** decimals);
  });

  it("Should successfully get initial referral payouts and set payouts", async function () {
    const { duckies }: TestContext = this as any;

    expect(await duckies._referralPayouts(0)).to.equal(500);
    expect(await duckies._referralPayouts(1)).to.equal(125);
    expect(await duckies._referralPayouts(2)).to.equal(80);
    expect(await duckies._referralPayouts(3)).to.equal(50);
    expect(await duckies._referralPayouts(4)).to.equal(20);

    await duckies.setReferralPayouts([10, 20, 30, 40, 50]);
    expect(await duckies._referralPayouts(0)).to.equal(10);
    expect(await duckies._referralPayouts(1)).to.equal(20);
    expect(await duckies._referralPayouts(2)).to.equal(30);
    expect(await duckies._referralPayouts(3)).to.equal(40);
    expect(await duckies._referralPayouts(4)).to.equal(50);
  });

  it("Should successfully get initial payouts and set payouts", async function () {
    const { duckies }: TestContext = this as any;

    expect(await duckies._bountyPayouts(0)).to.equal(50);
    expect(await duckies._bountyPayouts(1)).to.equal(25);
    expect(await duckies._bountyPayouts(2)).to.equal(15);
    expect(await duckies._bountyPayouts(3)).to.equal(10);
    expect(await duckies._bountyPayouts(4)).to.equal(5);

    await duckies.setBountyPayouts([10, 20, 30, 40, 50]);
    expect(await duckies._bountyPayouts(0)).to.equal(10);
    expect(await duckies._bountyPayouts(1)).to.equal(20);
    expect(await duckies._bountyPayouts(2)).to.equal(30);
    expect(await duckies._bountyPayouts(3)).to.equal(40);
    expect(await duckies._bountyPayouts(4)).to.equal(50);
  });

  it("Should successfully convert message to hash", async function () {
    const { duckies }: TestContext = this as any;
    const [ref] = await ethers.getSigners();

    const message = {
      ref: ref.address,
      amt: 100,
      id: 'message1',
      blockExpiration: 20,
      limit: 0,
    };

    expect(await duckies.getMessageHash(message)).to.equal(
      "0x270832bdd0fd3e9051b55f984454047dc60d47e4feff00bf7cc8e0fd7071387c"
    );
    expect(await duckies.getMessageHash(message)).to.have.length(66);
  });

  it("Should successfully convert messageHash to eth signed message hash", async function () {
    const { duckies }: TestContext = this as any;
    const [ref] = await ethers.getSigners();

    const message = {
      ref: ref.address,
      amt: 100,
      id: 'message1',
      blockExpiration: 20,
      limit: 0,
    };
    const messageHash = await duckies.getMessageHash(message);

    expect(await duckies.getEthSignedMessageHash(messageHash)).to.be.equal(
      "0x46bf4edfe3d2e9f2bf3074d6eeaadb4828165ce055efa2fde0816068eef0f8f1"
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
      id: 'message1',
      blockExpiration: 20,
      limit: 0,
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
    const payoutRefOne = await duckies._referralPayouts(0);
    const payoutRefTwo = await duckies._referralPayouts(1);
    const payoutRefThree = await duckies._referralPayouts(2);
    const payoutRefFour = await duckies._referralPayouts(3);
    const payoutRefFive = await duckies._referralPayouts(4);

    // preparing message and signature for first account
    const messageAccountZero = {
      ref: accounts[0].address,
      amt: 30000,
      id: 'message0',
      blockExpiration: 20,
      limit: 0,
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

    const balanceAccountOneStageOne = await duckies.balanceOf(accounts[1].address);
    expect(balanceAccountOneStageOne).to.be.equal(messageAccountZero.amt);

    const balanceAccountZeroStageOne = await duckies.balanceOf(accounts[0].address);
    expect(balanceAccountZeroStageOne).to.be.equal((messageAccountZero.amt * payoutRefOne) / 100);

    // preparing message and signature for second account
    const messageAccountOne = {
      ref: accounts[1].address,
      amt: 20000,
      id: 'message1',
      blockExpiration: 20,
      limit: 0,
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

    const balanceAccountTwoStageTwo = await duckies.balanceOf(accounts[2].address);
    expect(balanceAccountTwoStageTwo).to.be.equal(messageAccountOne.amt);

    const balanceAccountOneStageTwo = await duckies.balanceOf(accounts[1].address);
    expect(balanceAccountOneStageTwo).to.be.equal(+balanceAccountOneStageOne + (messageAccountOne.amt * payoutRefOne) / 100);

    const balanceAccountZeroStageTwo = await duckies.balanceOf(accounts[0].address);
    expect(balanceAccountZeroStageTwo).to.be.equal(+balanceAccountZeroStageOne + (messageAccountOne.amt * payoutRefTwo) / 100);

    // preparing message and signature for third account
    const messageAccountTwo = {
      ref: accounts[2].address,
      amt: 10000,
      id: 'message2',
      blockExpiration: 20,
      limit: 0,
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

    const balanceAccountThreeStageThree = await duckies.balanceOf(accounts[3].address);
    expect(balanceAccountThreeStageThree).to.be.equal(messageAccountTwo.amt);

    const balanceAccountTwoStageThree = await duckies.balanceOf(accounts[2].address);
    expect(balanceAccountTwoStageThree).to.be.equal(+balanceAccountTwoStageTwo + (messageAccountTwo.amt * payoutRefOne) / 100);

    const balanceAccountOneStageThree = await duckies.balanceOf(accounts[1].address);
    expect(balanceAccountOneStageThree).to.be.equal(+balanceAccountOneStageTwo + (messageAccountTwo.amt * payoutRefTwo) / 100);

    const balanceAccountZeroStageThree = await duckies.balanceOf(accounts[0].address);
    expect(balanceAccountZeroStageThree).to.be.equal(+balanceAccountZeroStageTwo + (messageAccountTwo.amt * payoutRefThree) / 100);

    // preparing message and signature for fourth account
    const messageAccountThree = {
      ref: accounts[3].address,
      amt: 5000,
      id: 'message3',
      blockExpiration: 20,
      limit: 0,
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

    const balanceAccountFourStageFour = await duckies.balanceOf(accounts[4].address);
    expect(balanceAccountFourStageFour).to.be.equal(messageAccountThree.amt);

    const balanceAccountThreeStageFour = await duckies.balanceOf(accounts[3].address);
    expect(balanceAccountThreeStageFour).to.be.equal(+balanceAccountThreeStageThree + (messageAccountThree.amt * payoutRefOne) / 100);

    const balanceAccountTwoStageFour = await duckies.balanceOf(accounts[2].address);
    expect(balanceAccountTwoStageFour).to.be.equal(+balanceAccountTwoStageThree + (messageAccountThree.amt * payoutRefTwo) / 100);

    const balanceAccountOneStageFour = await duckies.balanceOf(accounts[1].address);
    expect(balanceAccountOneStageFour).to.be.equal(+balanceAccountOneStageThree + (messageAccountThree.amt * payoutRefThree) / 100);

    const balanceAccountZeroStageFour = await duckies.balanceOf(accounts[0].address);
    expect(balanceAccountZeroStageFour).to.be.equal(+balanceAccountZeroStageThree + (messageAccountThree.amt * payoutRefFour) / 100);

    // preparing message and signature for fifth account
    const messageAccountFour = {
      ref: accounts[4].address,
      amt: 5000,
      id: 'message4',
      blockExpiration: 20,
      limit: 0,
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

    const balanceAccountFourStageFive = await duckies.balanceOf(accounts[4].address);
    expect(balanceAccountFourStageFive).to.be.equal(+balanceAccountFourStageFour + (messageAccountFour.amt * payoutRefOne) / 100);

    const balanceAccountThreeStageFive = await duckies.balanceOf(accounts[3].address);
    expect(balanceAccountThreeStageFive).to.be.equal(+balanceAccountThreeStageFour + (messageAccountFour.amt * payoutRefTwo) / 100);

    const balanceAccountTwoStageFive = await duckies.balanceOf(accounts[2].address);
    expect(balanceAccountTwoStageFive).to.be.equal(+balanceAccountTwoStageFour + (messageAccountFour.amt * payoutRefThree) / 100);

    const balanceAccountOneStageFive = await duckies.balanceOf(accounts[1].address);
    expect(balanceAccountOneStageFive).to.be.equal(+balanceAccountOneStageFour + (messageAccountFour.amt * payoutRefFour) / 100);

    const balanceAccountZeroStageFive = await duckies.balanceOf(accounts[0].address);
    expect(balanceAccountZeroStageFive).to.be.equal(+balanceAccountZeroStageFour + (messageAccountFour.amt * payoutRefFive) / 100);
  });

  it("should prevent getting award twice or more times", async function () {
    const { duckies }: TestContext = this as any;
    // eslint-disable-next-line no-unused-vars
    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;

    const message = {
      ref: accounts[0].address,
      amt: 30000,
      id: 'message',
      blockExpiration: 20,
      limit: 0,
    };
    const messageHash = await duckies.getMessageHash(
      message
    );
    const signature = await provider.send("personal_sign", [
      messageHash,
      signerAccount,
    ]);

    await duckies
      .connect(accounts[1])
      .reward(message, signature);

    const balance = await duckies.balanceOf(accounts[1].address);
    expect(balance).to.be.equal(message.amt);

    try {
      await duckies
      .connect(accounts[1])
      .reward(message, signature);

      assert(false);
    } catch (error) {
      assert(error); // checks the presence of error
    }

    const balanceAfterSecondAttempt = await duckies.balanceOf(accounts[1].address);
    expect(balanceAfterSecondAttempt).to.be.equal(message.amt);
  });

  it("account[0] cannot send reward with ref account[0]", async function () {
    const { duckies }: TestContext = this as any;
    // eslint-disable-next-line no-unused-vars
    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;

    const messageOne = {
      ref: accounts[0].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 20,
      limit: 0,
    };
    const messageHash = await duckies.getMessageHash(messageOne);
    const signature = await provider.send("personal_sign", [messageHash, signerAccount]);

    const balanceAccountZero = await duckies.balanceOf(accounts[0].address);
    expect(balanceAccountZero).to.be.equal(0);

    // account[0] cannot send reward with ref account[0]
    try {
      await duckies.connect(accounts[0]).reward(messageOne, signature);

      assert(false);
    } catch (error) {
      assert(error); // checks the presence of error
    }

    const balanceAccountZeroAfterRewardCall = await duckies.balanceOf(accounts[0].address);
    expect(balanceAccountZeroAfterRewardCall).to.be.equal(0);
  });

  it("account[1] can get reward with ref account[0]", async function () {
    const { duckies }: TestContext = this as any;
    // eslint-disable-next-line no-unused-vars
    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;
    const payoutRefOne = await duckies._referralPayouts(0);

    const messageOne = {
      ref: accounts[0].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 50,
      limit: 0,
    };
    const messageHash = await duckies.getMessageHash(messageOne);
    const signature = await provider.send("personal_sign", [messageHash, signerAccount]);

    // account[1] can send reward with ref account[0]
    const balanceAccountOne = await duckies.balanceOf(accounts[1].address);
    expect(balanceAccountOne).to.be.equal(0);

    try {
      await duckies.connect(accounts[1]).reward(messageOne, signature);

      assert(true);
    } catch (error) {
      assert(false);
    }

    const balanceAccountOneAfterRewardCall = await duckies.balanceOf(accounts[1].address);
    expect(balanceAccountOneAfterRewardCall).to.be.equal(messageOne.amt);

    const balanceZeroAfterSuccessfulReferalCall = await duckies.balanceOf(accounts[0].address);
    expect(balanceZeroAfterSuccessfulReferalCall).to.be.equal(messageOne.amt * payoutRefOne / 100);

    // account[1] cannot send another reward call if it already has a referrer
    try {
      await duckies.connect(accounts[1]).reward(messageOne, signature);

      assert(false);
    } catch (error) {
      assert(error); // checks the presence of error
    }

    const balanceOneAfterRepeatedReferalCall = await duckies.balanceOf(accounts[1].address);
    expect(balanceOneAfterRepeatedReferalCall).to.be.equal(messageOne.amt);
  });

  it("should correctly return affiliates of account", async function () {
    const { duckies }: TestContext = this as any;
    // eslint-disable-next-line no-unused-vars
    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;

    // first level
    const messageOne = {
      ref: accounts[0].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 50,
      limit: 0,
    };
    const messageHash = await duckies.getMessageHash(messageOne);
    const signatureOne = await provider.send("personal_sign", [messageHash, signerAccount]);

    await duckies.connect(accounts[1]).reward(messageOne, signatureOne);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([1, 0, 0, 0, 0]);

    await duckies.connect(accounts[2]).reward(messageOne, signatureOne);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 0, 0, 0, 0]);

    // second level
    const messageTwo = {
      ref: accounts[1].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 50,
      limit: 0,
    };
    const messageTwoHash = await duckies.getMessageHash(messageTwo);
    const signatureTwo = await provider.send("personal_sign", [messageTwoHash, signerAccount]);

    await duckies.connect(accounts[3]).reward(messageTwo, signatureTwo);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([1, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 1, 0, 0, 0]);

    await duckies.connect(accounts[4]).reward(messageTwo, signatureTwo);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([2, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 2, 0, 0, 0]);

    await duckies.connect(accounts[5]).reward(messageTwo, signatureTwo);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 0, 0, 0]);

    // third level
    const messageThree = {
      ref: accounts[5].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 50,
      limit: 0,
    };
    const messageThreeHash = await duckies.getMessageHash(messageThree);
    const signatureThree = await provider.send("personal_sign", [messageThreeHash, signerAccount]);

    await duckies.connect(accounts[6]).reward(messageThree, signatureThree);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 0, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 0, 0]);

    // fourth level
    const messageFour = {
      ref: accounts[6].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 50,
      limit: 0,
    };
    const messageFourHash = await duckies.getMessageHash(messageFour);
    const signatureFour = await provider.send("personal_sign", [messageFourHash, signerAccount]);

    await duckies.connect(accounts[7]).reward(messageFour, signatureFour);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([1, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 1, 0, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 1, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 1, 0]);

    await duckies.connect(accounts[8]).reward(messageFour, signatureFour);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([2, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 2, 0, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 2, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 2, 0]);

    await duckies.connect(accounts[9]).reward(messageFour, signatureFour);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([3, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 3, 0, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 3, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 3, 0]);

    await duckies.connect(accounts[10]).reward(messageFour, signatureFour);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([4, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 4, 0, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 4, 0, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 4, 0]);

    // fifth level
    const messageFive = {
      ref: accounts[10].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 50,
      limit: 0,
    };
    const messageFiveHash = await duckies.getMessageHash(messageFive);
    const signatureFive = await provider.send("personal_sign", [messageFiveHash, signerAccount]);

    await duckies.connect(accounts[11]).reward(messageFive, signatureFive);
    expect(await duckies.connect(accounts[10]).getAffiliatesCount()).to.be.eql([1, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([4, 1, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 4, 1, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 4, 1, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 4, 1]);

    await duckies.connect(accounts[12]).reward(messageFive, signatureFive);
    expect(await duckies.connect(accounts[10]).getAffiliatesCount()).to.be.eql([2, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([4, 2, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 4, 2, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 4, 2, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 4, 2]);

    await duckies.connect(accounts[13]).reward(messageFive, signatureFive);
    expect(await duckies.connect(accounts[10]).getAffiliatesCount()).to.be.eql([3, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([4, 3, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 4, 3, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 4, 3, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 4, 3]);

    await duckies.connect(accounts[14]).reward(messageFive, signatureFive);
    expect(await duckies.connect(accounts[10]).getAffiliatesCount()).to.be.eql([4, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([4, 4, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 4, 4, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 4, 4, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 4, 4]);

    await duckies.connect(accounts[15]).reward(messageFive, signatureFive);
    expect(await duckies.connect(accounts[10]).getAffiliatesCount()).to.be.eql([5, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([4, 5, 0, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 4, 5, 0, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 4, 5, 0]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 4, 5]);


    // sixth level
    const messageSix = {
      ref: accounts[15].address,
      amt: 1000,
      id: 'messageOne',
      blockExpiration: 50,
      limit: 0,
    };
    const messageSixHash = await duckies.getMessageHash(messageSix);
    const signatureSix = await provider.send("personal_sign", [messageSixHash, signerAccount]);

    await duckies.connect(accounts[16]).reward(messageSix, signatureSix);
    expect(await duckies.connect(accounts[15]).getAffiliatesCount()).to.be.eql([1, 0, 0, 0, 0]);
    expect(await duckies.connect(accounts[10]).getAffiliatesCount()).to.be.eql([5, 1, 0, 0, 0]);
    expect(await duckies.connect(accounts[6]).getAffiliatesCount()).to.be.eql([4, 5, 1, 0, 0]);
    expect(await duckies.connect(accounts[5]).getAffiliatesCount()).to.be.eql([1, 4, 5, 1, 0]);
    expect(await duckies.connect(accounts[1]).getAffiliatesCount()).to.be.eql([3, 1, 4, 5, 1]);
    expect(await duckies.connect(accounts[0]).getAffiliatesCount()).to.be.eql([2, 3, 1, 4, 5]);

  });

  it("should successfully get all payouts array", async function () {
    const { duckies }: TestContext = this as any;

    expect(await duckies.getReferralPayouts()).to.be.eql([500, 125, 80, 50, 20]);
  });

  it("should successfully get all payouts array", async function () {
    const { duckies }: TestContext = this as any;

    expect(await duckies.getBountyPayouts()).to.be.eql([50, 25, 15, 10, 5]);
  });

  it("should allow receive the bounty limited times", async function () {
    const { duckies }: TestContext = this as any;

    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;

    const message = {
      ref: '0x0000000000000000000000000000000000000000',
      amt: 1000,
      id: 'message',
      blockExpiration: 100,
      limit: 3,
    };

    const messageHash = await duckies.getMessageHash(message);
    const signature = await provider.send("personal_sign", [messageHash, signerAccount]);

    await duckies.connect(accounts[1]).reward(message, signature);
    expect(await duckies.balanceOf(accounts[1].address)).to.be.equal(1000);

    await duckies.connect(accounts[1]).reward(message, signature);
    expect(await duckies.balanceOf(accounts[1].address)).to.be.equal(2000);

    await duckies.connect(accounts[1]).reward(message, signature);
    expect(await duckies.balanceOf(accounts[1].address)).to.be.equal(3000);

    try {
      await duckies.connect(accounts[1]).reward(message, signature);

      assert(false);
    } catch (error) {
      assert(error);
    } finally {
      expect(await duckies.balanceOf(accounts[1].address)).to.be.equal(3000);
    }
  });

  it("should return count of claimed rewards of specific bounty for user", async function() {
    const { duckies }: TestContext = this as any;

    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;

    const message = {
      ref: '0x0000000000000000000000000000000000000000',
      amt: 1000,
      id: 'message',
      blockExpiration: 100,
      limit: 3,
    };

    let countOfReceivedBounty = await duckies.connect(accounts[1]).getAccountBountyLimit(message.id);
    expect(countOfReceivedBounty).to.be.equal(0);

    const messageHash = await duckies.getMessageHash(message);
    const signature = await provider.send("personal_sign", [messageHash, signerAccount]);

    await duckies.connect(accounts[1]).reward(message, signature);
    expect(await duckies.balanceOf(accounts[1].address)).to.be.equal(1000);

    countOfReceivedBounty = await duckies.connect(accounts[1]).getAccountBountyLimit(message.id);
    expect(countOfReceivedBounty).to.be.equal(1);
  });

  it("should claim several rewards", async function() {
    const { duckies }: TestContext = this as any;

    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;

    const messageOne = {
      ref: '0x0000000000000000000000000000000000000000',
      amt: 1000,
      id: 'message-1',
      blockExpiration: 100,
      limit: 1,
    };

    const messageTwo = {
      ref: '0x0000000000000000000000000000000000000000',
      amt: 500,
      id: 'message-2',
      blockExpiration: 100,
      limit: 1,
    };

    const messageThree = {
      ref: '0x0000000000000000000000000000000000000000',
      amt: 250,
      id: 'message-3',
      blockExpiration: 100,
      limit: 1,
    };

    const messageOneHash = await duckies.getMessageHash(messageOne);
    const signatureOne = await provider.send("personal_sign", [messageOneHash, signerAccount]);

    const messageTwoHash = await duckies.getMessageHash(messageTwo);
    const signatureTwo = await provider.send("personal_sign", [messageTwoHash, signerAccount]);

    const messageThreeHash = await duckies.getMessageHash(messageThree);
    const signatureThree = await provider.send("personal_sign", [messageThreeHash, signerAccount]);

    expect(await duckies.balanceOf(accounts[0].address)).to.be.equal(0);

    const messagesToClaim = [
      {
        message: messageOne,
        signature: signatureOne,
      },
      {
        message: messageTwo,
        signature: signatureTwo,
      },
      {
        message: messageThree,
        signature: signatureThree,
      },
    ];

    await duckies.connect(accounts[0]).claimRewards(messagesToClaim);

    expect(await duckies.balanceOf(accounts[0].address)).to.be.equal(1750);
  });

  it("should fail claiming of several rewards if limit is reached", async function() {
    const { duckies }: TestContext = this as any;

    const [_owner, signer, ...accounts] = await ethers.getSigners();
    const provider = ethers.provider;
    const signerAccount = signer.address;

    const messageOne = {
      ref: '0x0000000000000000000000000000000000000000',
      amt: 1000,
      id: 'message-1',
      blockExpiration: 100,
      limit: 1,
    };

    const messageTwo = {
      ref: '0x0000000000000000000000000000000000000000',
      amt: 500,
      id: 'message-2',
      blockExpiration: 100,
      limit: 1,
    };

    const messageOneHash = await duckies.getMessageHash(messageOne);
    const signatureOne = await provider.send("personal_sign", [messageOneHash, signerAccount]);

    const messageTwoHash = await duckies.getMessageHash(messageTwo);
    const signatureTwo = await provider.send("personal_sign", [messageTwoHash, signerAccount]);

    expect(await duckies.balanceOf(accounts[0].address)).to.be.equal(0);

    const messagesToClaim = [
      {
        message: messageOne,
        signature: signatureOne,
      },
      {
        message: messageOne,
        signature: signatureOne,
      },
      {
        message: messageTwo,
        signature: signatureTwo,
      },
    ];

    try {
      await duckies.connect(accounts[0]).claimRewards(messagesToClaim);

      assert(false);
    } catch (error) {
      assert(error);
    }

    expect(await duckies.balanceOf(accounts[0].address)).to.be.equal(0);
  });
});
