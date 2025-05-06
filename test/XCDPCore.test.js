const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("XCDPCore", function () {
    let xcdpCore;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const XCDPCore = await ethers.getContractFactory("XCDPCore");
        xcdpCore = await XCDPCore.deploy(addr1.address); // addr1 as gateway
        await xcdpCore.deployed();
    });

    describe("Deployment", function () {
        it("Should set the gateway address correctly", async function () {
            expect(await xcdpCore.gateway()).to.equal(addr1.address);
        });
    });

    describe("Message Sending", function () {
        it("Should emit XTalkMessageBroadcasted event when sending message", async function () {
            const message = {
                targetChainId: 2,
                targetAddress: addr2.address,
                data: ethers.utils.defaultAbiCoder.encode(
                    ["string", "uint256"],
                    ["test", 123]
                ),
            };

            await expect(xcdpCore.sendMessage(message.targetChainId, message.targetAddress, message.data))
                .to.emit(xcdpCore, "XTalkMessageBroadcasted")
                .withArgs(message.targetChainId, message.targetAddress, message.data);
        });
    });

    describe("Message Receiving", function () {
        it("Should store received message correctly", async function () {
            const message = {
                sourceChainId: 2,
                sourceAddress: addr2.address,
                data: ethers.utils.defaultAbiCoder.encode(
                    ["string", "uint256"],
                    ["test", 123]
                ),
            };

            // Only gateway can call _l1xReceive
            await expect(
                xcdpCore.connect(addr2)._l1xReceive(
                    message.sourceChainId,
                    message.sourceAddress,
                    message.data
                )
            ).to.be.revertedWith("Caller is not xtalk node");

            // Gateway should be able to call _l1xReceive
            await xcdpCore.connect(addr1)._l1xReceive(
                message.sourceChainId,
                message.sourceAddress,
                message.data
            );

            // Verify message was stored
            const storedMessage = await xcdpCore.messages(0);
            expect(storedMessage.sourceChainId).to.equal(message.sourceChainId);
            expect(storedMessage.sourceAddress).to.equal(message.sourceAddress);
            expect(storedMessage.data).to.equal(message.data);
        });
    });
}); 