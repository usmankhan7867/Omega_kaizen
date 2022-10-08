const Omega = artifacts.require('Omega')
const Ox = artifacts.require('Ox')
const OmegaIdo = artifacts.require('OmegaIdo')

require('chai').use(require('chai-as-promised')).should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('OmegaIdo', ([owner, teamMember1, buyer1, buyer2, buyer3]) => {
  let omegaToken, oxToken, omegaIdo
  let omegaPrice = 50 // OX

  before(async () => {
    omegaToken = await Omega.new()
    oxToken = await Ox.new()
    omegaIdo = await OmegaIdo.new(omegaToken.address, oxToken.address, omegaPrice)

    omegaBalance = await omegaToken.balanceOf(owner)
    await omegaToken.transfer(omegaIdo.address, omegaBalance.toString(), { from: owner })
  })

  describe('Contract constructor', async () => {
    it('sets OM address', async () => {
      const omegaAddress = await omegaIdo.omegaAddress.call()
      assert.equal(omegaAddress, omegaToken.address)

      const oxAddress = await omegaIdo.oxAddress.call()
      assert.equal(oxAddress, oxToken.address)
    })

    it('has correct OM price', async () => {
      const omegaPrice = await omegaIdo.pricePerOmegaPercent.call()
      assert.equal(omegaPrice, 50)
    })
  })

  describe('#sellOmegaToken', async () => {
    before(async () => {
      await oxToken.transfer(buyer1, tokens('2000'), { from: owner })
    })

    it('buyer buys 100 OM tokens', async () => {
      const omegaAmountBefore = await omegaToken.balanceOf.call(buyer1)
      assert.equal(omegaAmountBefore, tokens('0'))
      const oxAmountBefore = await oxToken.balanceOf.call(buyer1)
      assert.equal(oxAmountBefore, tokens('2000'))

      await oxToken.approve(omegaIdo.address, tokens('10000'), { from: buyer1 })
      await omegaIdo.sellOmegaToken(buyer1, tokens('100'), { from: buyer1 })

      const omegaAmountAfter = await omegaToken.balanceOf.call(buyer1)
      assert.equal(omegaAmountAfter, tokens('100'))
      const oxAmountAfter = await oxToken.balanceOf.call(buyer1)
      assert.equal(oxAmountAfter, tokens('1950'))
    })

    it('buyer buys 1000 OM tokens', async () => {
      const omegaAmountBefore = await omegaToken.balanceOf.call(buyer1)
      assert.equal(omegaAmountBefore, tokens('100'))
      const oxAmountBefore = await oxToken.balanceOf.call(buyer1)
      assert.equal(oxAmountBefore, tokens('1950'))

      await oxToken.approve(omegaIdo.address, tokens('10000'), { from: buyer1 })
      await omegaIdo.sellOmegaToken(buyer1, tokens('1000'), { from: buyer1 })

      const omegaAmountAfter = await omegaToken.balanceOf.call(buyer1)
      assert.equal(omegaAmountAfter, tokens('1100'))
      const oxAmountAfter = await oxToken.balanceOf.call(buyer1)
      assert.equal(oxAmountAfter, tokens('1450'))
    })

    it('buyer buys 11.5 OM tokens', async () => {
      const omegaAmountBefore = await omegaToken.balanceOf.call(buyer1)
      assert.equal(omegaAmountBefore, tokens('1100'))
      const oxAmountBefore = await oxToken.balanceOf.call(buyer1)
      assert.equal(oxAmountBefore, tokens('1450'))

      await oxToken.approve(omegaIdo.address, tokens('10000'), { from: buyer1 })
      await omegaIdo.sellOmegaToken(buyer1, tokens('11.5'), { from: buyer1 })

      const omegaAmountAfter = await omegaToken.balanceOf.call(buyer1)
      assert.equal(omegaAmountAfter, tokens('1111.5'))
      const oxAmountAfter = await oxToken.balanceOf.call(buyer1)
      assert.equal(oxAmountAfter, tokens('1444.25'))
    })
  })

  describe('#updatePrice', async () => {
    it('updates OM IDO price from 50 OX to 5 OX', async () => {
      const priceBefore = await omegaIdo.pricePerOmegaPercent.call()
      assert.equal(priceBefore.toNumber(), 50)

      await omegaIdo.updatePrice(5, { from: owner }) // Value in cents! 0.05 OX

      const priceAfter = await omegaIdo.pricePerOmegaPercent.call()
      assert.equal(priceAfter.toNumber(), 5)
    })

    it('updates OM IDO price from 5 OX to 100 OX', async () => {
      const priceBefore = await omegaIdo.pricePerOmegaPercent.call()
      assert.equal(priceBefore.toNumber(), 5)

      await omegaIdo.updatePrice(100, { from: owner }) // Value in cents! 1 OX

      const priceAfter = await omegaIdo.pricePerOmegaPercent.call()
      assert.equal(priceAfter.toNumber(), 100)
    })
  })

  describe('#withdrawOmegaFromIdo', async () => {
    it('fails for non-owner', async () => {
      const oxAmountBefore = await omegaToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountBefore, tokens('998888.5'))

      try {
        await omegaIdo.withdrawOmegaFromIdo(teamMember1, tokens('1000'), { from: teamMember1 })
      } catch {}

      const oxAmountAfter = await omegaToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountAfter, tokens('998888.5'))
    })

    it('withdraw some OM from IDO contract', async () => {
      const omegaAmountBefore = await omegaToken.balanceOf.call(omegaIdo.address)
      assert.equal(omegaAmountBefore, tokens('998888.5'))

      await omegaIdo.withdrawOmegaFromIdo(teamMember1, tokens('1000'), { from: owner })

      const omegaAmountAfter = await omegaToken.balanceOf.call(omegaIdo.address)
      assert.equal(omegaAmountAfter, tokens('997888.5'))

      const omegaAmountToAddress = await omegaToken.balanceOf.call(teamMember1)
      assert.equal(omegaAmountToAddress, tokens('1000'))
    })

    it('withdraw all OM from IDO contract', async () => {
      const omegaAmountBefore = await omegaToken.balanceOf.call(omegaIdo.address)
      assert.equal(omegaAmountBefore, tokens('997888.5'))

      await omegaIdo.withdrawOmegaFromIdo(teamMember1, omegaAmountBefore, { from: owner })

      const omegaAmountAfter = await omegaToken.balanceOf.call(omegaIdo.address)
      assert.equal(omegaAmountAfter, tokens('0'))

      const omegaAmountToAddress = await omegaToken.balanceOf.call(teamMember1)
      assert.equal(omegaAmountToAddress, tokens('998888.5'))
    })
  })

  describe('#withdrawOxFromIdo', async () => {
    before(async () => {
      const initOxAmount = await oxToken.balanceOf.call(owner)
      await oxToken.transfer(omegaIdo.address, initOxAmount, { from: owner })
    })

    it('fails for non-owner', async () => {
      const oxAmountBefore = await oxToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountBefore, tokens('998555.75'))

      try {
        await omegaIdo.withdrawOxFromIdo(user1, tokens('1000'), { from: user1 })
      } catch {}

      const oxAmountAfter = await oxToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountAfter, tokens('998555.75'))
    })

    it('withdraw some OM from IDO contract', async () => {
      const oxAmountBefore = await oxToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountBefore, tokens('998555.75'))

      await omegaIdo.withdrawOxFromIdo(teamMember1, tokens('1000'), { from: owner })

      const oxAmountAfter = await oxToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountAfter, tokens('997555.75'))

      const oxAmountToAddress = await oxToken.balanceOf.call(teamMember1)
      assert.equal(oxAmountToAddress, tokens('1000'))
    })

    it('withdraw all OM from IDO contract', async () => {
      const oxAmountBefore = await oxToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountBefore, tokens('997555.75'))

      await omegaIdo.withdrawOxFromIdo(teamMember1, oxAmountBefore, { from: owner })

      const oxAmountAfter = await oxToken.balanceOf.call(omegaIdo.address)
      assert.equal(oxAmountAfter, tokens('0'))

      const oxAmountToAddress = await oxToken.balanceOf.call(teamMember1)
      assert.equal(oxAmountToAddress, tokens('998555.75'))
    })
  })
})
