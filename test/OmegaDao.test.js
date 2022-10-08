const Omega = artifacts.require('Omega')
const Ox = artifacts.require('Ox')
const OmegaDao2 = artifacts.require('OmegaDao')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('OmegaDao', ([owner, investor, teamMember1, teamMember2, teamMember3, user1]) => {
  let omegaToken, oxToken, omegaDao, pool

  before(async () => {
    omegaToken = await Omega.new()
    oxToken = await Ox.new()
    omegaDao = await OmegaDao2.new(
      omegaToken.address,
      oxToken.address,
      [teamMember1, teamMember2, teamMember3]
    )
    pool = omegaDao.address

    await omegaToken.setDaoContract(omegaDao.address)
  })

  describe('Contract constructor', async () => {
    it('assigns team nodes', async () => {
      const teamMemberAddress0 = await omegaDao.omegaNodesAddresses.call(0)
      assert.equal(teamMemberAddress0, teamMember1)

      const teamMemberAddress1 = await omegaDao.omegaNodesAddresses.call(1)
      assert.equal(teamMemberAddress1, teamMember2)
    })

    it('has correct number of nodes', async () => {
      const teamMemberAccount0 = await omegaDao.accounts.call(teamMember1)
      assert.equal(teamMemberAccount0.tabithaCount, 10)

      const teamMemberAccount1 = await omegaDao.accounts.call(teamMember2)
      assert.equal(teamMemberAccount1.tabithaCount, 10)
    })

    it('total nodes are 30', async () => {
      const totalNodes = await omegaDao.totalNodes.call()
      assert.equal(totalNodes, 30)
    })
  })

  describe('#mintNode', async () => {
    before(async () => {
      await oxToken.transfer(investor, tokens('10000'), { from: owner })
      await omegaToken.transfer(investor, tokens('1000'), { from: owner })

      await oxToken.transfer(teamMember1, tokens('10000'), { from: owner })
      await omegaToken.transfer(teamMember1, tokens('1000'), { from: owner })
    })

    it('mints first node for user', async () => {
      result = await oxToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('10000'), 'investor OX wallet balance correct before minting node')

      result = await omegaToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('1000'), 'investor OM wallet balance correct before minting node')

      result = await oxToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('0'), 'OX pool wallet balance correct before minting node')

      result = await omegaToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('0'), 'OM pool wallet balance correct before minting node')

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: investor })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: investor })

      await omegaDao.mintNode(investor, tokens('500'), tokens('500'), 2, { from: investor })

      result = await oxToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'pool OX wallet balance correct after minting node')

      result = await omegaToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'pool OM wallet balance correct after minting node')

      const accountForAddress = await omegaDao.accounts.call(investor)
      assert.equal(accountForAddress.phiCount, 1)

      const totalNodes = await omegaDao.totalNodes.call()
      assert.equal(totalNodes, 31)
    })

    it('mints another node for user', async () => {
      result = await oxToken.balanceOf(teamMember1)
      assert.equal(result.toString(), tokens('10000'), 'investor OX wallet balance correct before minting node')

      result = await omegaToken.balanceOf(teamMember1)
      assert.equal(result.toString(), tokens('1000'), 'investor OM wallet balance correct before minting node')

      result = await oxToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'OX pool wallet balance correct before minting node')

      result = await omegaToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'OX pool wallet balance correct before minting node')

      await oxToken.approve(omegaDao.address, tokens('500'), { from: teamMember1 })
      await omegaToken.approve(omegaDao.address, tokens('500'), { from: teamMember1 })

      await omegaDao.mintNode(teamMember1, tokens('500'), tokens('500'), 2, { from: teamMember1 })

      result = await oxToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1000'), 'pool OX wallet balance correct after minting node')

      result = await omegaToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1000'), 'pool OM wallet balance correct after minting node')

      const accountForAddress = await omegaDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.tabithaCount, 10)

      const totalNodes = await omegaDao.totalNodes.call()
      assert.equal(totalNodes, 32)
    })
  })

  describe('#payInterest', async () => {
    it('pays interest to node holders', async () => {
      let accountForAddress = await omegaDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      accountForAddress = await omegaDao.accounts.call(teamMember2)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      accountForAddress = await omegaDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      accountForAddress = await omegaDao.accounts.call(investor)
      assert.equal(accountForAddress.tabithaCount, 0)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      // runs day 1
      await omegaDao.payInterest({ from: owner })

      accountForAddress = await omegaDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('1007'))

      accountForAddress = await omegaDao.accounts.call(teamMember2)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('1000'))

      accountForAddress = await omegaDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('1000'))

      accountForAddress = await omegaDao.accounts.call(investor)
      assert.equal(accountForAddress.tabithaCount, 0)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('7'))

      // runs day 2
      await omegaDao.payInterest({ from: owner })

      accountForAddress = await omegaDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('2014'))

      accountForAddress = await omegaDao.accounts.call(teamMember2)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('2000'))

      accountForAddress = await omegaDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.tabithaCount, 10)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('2000'))

      accountForAddress = await omegaDao.accounts.call(investor)
      assert.equal(accountForAddress.tabithaCount, 0)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.iotaCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('14'))
    })
  })

  describe('#widthrawInterest', async () => {
    it('user can widthraw their OM interest', async () => {
      accountForAddress = await omegaDao.accounts.call(investor)
      assert.equal(accountForAddress.phiCount, 1)
      assert.equal(accountForAddress.interestAccumulated, tokens('14'))

      result = await omegaToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('500'), 'pool OM wallet balance correct after minting node')

      await omegaDao.widthrawInterest(investor, { from: investor })

      accountForAddress = await omegaDao.accounts.call(investor)
      assert.equal(accountForAddress.interestAccumulated, 0)

      result = await omegaToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('514'), 'pool OM wallet balance correct after minting node')
    })
  })

  describe('#balancePool', async () => {
    it('balances pool when there are too little tokens', async () => {
      // from 96 OM to 220460
      poolOfOmega = await omegaToken.balanceOf(pool)
      assert.equal(poolOfOmega.toString(), tokens('986'), 'pool OM wallet balance correct before balancing')

      await omegaDao.balancePool({ from: owner })

      result = await omegaToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1168000'), 'pool OM wallet balance correct after balancing')
    })

    it('balances pool when there are too many tokens', async () => {
      await omegaToken.mint(tokens('10000000'), { from: owner })
      await omegaToken.transfer(pool, tokens('10000000'), { from: owner })

      // from 1220460 OM to 220460
      poolOfOmega = await omegaToken.balanceOf(pool)
      assert.equal(poolOfOmega.toString(), tokens('11168000'), 'pool OM wallet balance correct before balancing')

      await omegaDao.balancePool({ from: owner })

      result = await omegaToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1168000'), 'pool OM wallet balance correct after balancing')
    })
  })

  describe('#changeInterestRate', async () => {
    it('updates the daily interest to 3', async () => {
      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '100', 'initial interest when contract is launched.')

      await omegaDao.changeInterestRate(300, { from: owner })

      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '300', 'interest after change.')
    })

    it('updates the daily interest to 1', async () => {
      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '300', 'initial interest when contract is launched.')

      await omegaDao.changeInterestRate(100, { from: owner })

      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '100', 'interest after change.')
    })

    it('updates the daily interest to 0.5', async () => {
      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '100', 'initial interest when contract is launched.')

      await omegaDao.changeInterestRate(50, { from: owner })

      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '50', 'interest after change.')
    })

    it('updates the daily interest to 0.3', async () => {
      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '50', 'initial interest when contract is launched.')

      await omegaDao.changeInterestRate(30, { from: owner })

      result = await omegaDao.omegaInterestRatePercent.call()
      assert.equal(result.toString(), '30', 'interest after change.')
    })
  })

  describe('#burnOmega', async () => {
    it('burns OM by sending it to an address', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await omegaToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), '0')

      await omegaDao.burnOmega(target, amount, { from: owner })

      balanceAfter = await omegaToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })

    it('fails because address isn\'t owner', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await omegaToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), tokens('100'))

      try {
        await omegaDao.burnOmega(target, amount, { from: teamMember1 })
        await omegaDao.burnOmega(target, amount, { from: teamMember2 })
        await omegaDao.burnOmega(target, amount, { from: teamMember3 })
      } catch {}

      balanceAfter = await omegaToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })
  })

  describe('#addOxToLiquidityPool', async () => {
    it('moves OX by sending it to an address', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await oxToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), '0')

      await omegaDao.addOxToLiquidityPool(target, amount, { from: owner })

      balanceAfter = await oxToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })

    it('fails because address isn\'t owner', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await oxToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), tokens('100'))

      try {
        await omegaDao.addOxToLiquidityPool(target, amount, { from: teamMember1 })
        await omegaDao.addOxToLiquidityPool(target, amount, { from: teamMember2 })
        await omegaDao.addOxToLiquidityPool(target, amount, { from: teamMember3 })
      } catch {}

      balanceAfter = await oxToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })
  })

  describe('#awardNode', async () => {
    it('award more nodes to account with existing nodes', async () => {
      accountForAddress = await omegaDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.phiCount, 0)
      numOfnodesBefore = parseInt(accountForAddress.phiCount.toString())

      await omegaDao.awardNode(teamMember3, 2, { from: owner })

      accountForAddress = await omegaDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.phiCount, 1)
      numOfnodesAfter = parseInt(accountForAddress.phiCount.toString())

      assert.equal(numOfnodesAfter, numOfnodesBefore + 1)
    })

    it('fails because from address isn\'t owner', async () => {
      accountForAddress = await omegaDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.phiCount, 1)
      numOfnodesBefore = parseInt(accountForAddress.phiCount.toString())

      try {
        await omegaDao.awardNode(teamMember3, 2, { from: teamMember1 })
        await omegaDao.awardNode(teamMember3, 2, { from: teamMember3 })
      } catch {}
      accountForAddress = await omegaDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.phiCount, 1)
    })
  })
})
