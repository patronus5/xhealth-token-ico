const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber, constants: { MaxUint256, AddressZero } } = require("ethers");


describe("xHEALTH Test", function() {
    let owner;
    let wallet, wallet0, wallet1, wallet2;
    let BUSD, xHealth;
    const balances = [5000, 6000, 7500];

    const expandTo18Decimals = (n) => {
        return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
    }

    beforeEach(async() => {
        console.log('-----------------Init--------------------')

        let signers = await ethers.getSigners();
        owner = signers[0]
        wallet0 = signers[1]
        wallet1 = signers[2]
        wallet2 = signers[3]
        wallet = [wallet0, wallet1, wallet2];

        console.log('Owner: ', owner.address)

        const _BUSD = await ethers.getContractFactory("BEP20Token");
        BUSD = await _BUSD.deploy();
        await BUSD.deployed()
        console.log('BUSD address: ', BUSD.address)
        console.log('Owner BUSD balance: ', ethers.utils.formatEther((await BUSD.balanceOf(owner.address))))

        const xHEALTH = await ethers.getContractFactory("xHEALTH");
        xHealth = await xHEALTH.deploy(
            BUSD.address
        );
        xHealth.deployed()
        console.log('xHEALTH address: ', xHealth.address)
        
        for(let i = 0; i < 3; i++) {
            await BUSD.transfer(wallet[i].address, expandTo18Decimals(balances[i]));
            console.log('BUSD transferred: %s -> %s: %d', owner.address, wallet[i].address, balances[i]);
            console.log('Wallet%d BUSD balance: %s', i, ethers.utils.formatEther(await BUSD.balanceOf(wallet[i].address)))
        }
    })

    it("buyTokenInPresale", async() => {
        console.log('------------------Add Wallet0 To WhiteList-------------------')
        
        await xHealth.includeInWhitelist(wallet[0].address)
        console.log(await xHealth.isInWhitelist(wallet[0].address))
        console.log("Wallet0 added to whitelist successfully.")
        
        console.log('------------------Buy Token In Presale-------------------')

        console.log('Wallet0 BUSD balance: ', ethers.utils.formatEther(await BUSD.balanceOf(wallet[0].address)))
        await BUSD.connect(wallet[0]).approve(xHealth.address, MaxUint256)

        console.log('Wallet0 is trying to buy 50 xHEALTH...')
        await xHealth.buyToken(wallet[0].address, expandTo18Decimals(50))
        console.log('Wallet0 BUSD balance: ', ethers.utils.formatEther(await BUSD.balanceOf(wallet[0].address)))
        console.log('Wallet0 xHEALTH balance: ', ethers.utils.formatEther((await xHealth.balanceOf(wallet[0].address))))
        
        console.log('-----------------------------------------------------------')
    })

    it("buyTokenInPublicsale", async() => {
        console.log('------------------Buy Token In Publicsale-------------------')

        console.log('Wallet1 BUSD balance: ', ethers.utils.formatEther((await BUSD.balanceOf(wallet[1].address))))
        await BUSD.connect(wallet[1]).approve(xHealth.address, MaxUint256)
        
        await xHealth.tooglePresale(false)

        console.log('Wallet1 is trying to buy 150 xHEALTH...')
        await xHealth.buyToken(wallet[1].address, expandTo18Decimals(150))
        console.log('Wallet1 BUSD balance: ',  ethers.utils.formatEther(await BUSD.balanceOf(wallet[1].address)))
        console.log('Wallet1 xHEALTH balance: ',  ethers.utils.formatEther(await xHealth.balanceOf(wallet[1].address)))
        
        console.log('-----------------------------------------------------------')
    })
})