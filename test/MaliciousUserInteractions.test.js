const Omega = artifacts.require('Omega')
const Ox = artifacts.require('Ox')
const OmegaDao2 = artifacts.require('OmegaDao')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('OmegaDao', ([owner, investor, teamMember1, teamMember2, teamMember3, user1, user2]) => {
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

  describe('User has no records to start with', async () => {
    it('has correct number of nodes and rewards', async () => {
      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.iotaCount, 0)
      assert.equal(userAccount.lambdaCount, 0)
      assert.equal(userAccount.phiCount, 0)
      assert.equal(userAccount.chiliaCount, 0)
      assert.equal(userAccount.tabithaCount, 0)

      assert.equal(userAccount.interestAccumulated, 0)
    })
  })

  describe('User creates a node', async () => {
    before(async () => {
      await oxToken.transfer(user1, tokens('10000'), { from: owner })
      await omegaToken.transfer(user1, tokens('10000'), { from: owner })
    })

    it('iota node is created suceessfully', async () => {
      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      await omegaDao.mintNode(user1, tokens('100'), tokens('100'), 0, { from: user1 })
      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.iotaCount, 1)
    })
  })

  describe('User tries to create a node with less coins than required', async () => {
    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await omegaDao.mintNode(user1, tokens('100'), tokens('100'), 1, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })

    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await omegaDao.mintNode(user1, tokens('0'), tokens('0'), 1, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })

    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await omegaDao.mintNode(user1, tokens('249'), tokens('249'), 1, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })

    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await omegaDao.mintNode(user1, tokens('0'), tokens('250'), 1, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })

    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await omegaDao.mintNode(user1, tokens('250'), tokens('0'), 1, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })

    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await omegaDao.mintNode(user1, -1, -1, 1, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })

    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        await omegaDao.mintNode(user1, tokens('250'), tokens('250'), 1, { from: teamMember1 })
        await omegaDao.mintNode(user1, tokens('250'), tokens('250'), 1, { from: teamMember2 })
        await omegaDao.mintNode(user1, tokens('250'), tokens('250'), 1, { from: owner })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })

    it('lambda node fails to create', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await omegaDao.mintNode(user1, tokens('99.9'), tokens('99.9'), 0, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 0)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), oxBalanceBefore.toString())
      assert.equal(omegaBalanceAfter.toString(), omegaBalanceBefore.toString())
    })
  })

  describe('User creates a node with a lot more tokens', async () => {
    it('lambda node is created', async () => {
      let oxBalanceBefore = await oxToken.balanceOf(user1)
      let omegaBalanceBefore = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceBefore.toString(), tokens('9900'))
      assert.equal(omegaBalanceBefore.toString(), tokens('9900'))

      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user1 })

      try {
        // double tokens supplied
        await omegaDao.mintNode(user1, tokens('500'), tokens('500'), 1, { from: user1 })
      } catch {}

      const userAccount = await omegaDao.accounts.call(user1)
      assert.equal(userAccount.lambdaCount, 1)

      let oxBalanceAfter = await oxToken.balanceOf(user1)
      let omegaBalanceAfter = await omegaToken.balanceOf(user1)
      assert.equal(oxBalanceAfter.toString(), tokens('9400'))
      assert.equal(omegaBalanceAfter.toString(), tokens('9400'))
    })
  })

  describe('User redeemes awarded OM', async () => {
    before(async () => {
      await oxToken.transfer(user2, tokens('1000'), { from: owner })
      await omegaToken.transfer(user2, tokens('1000'), { from: owner })
      // create nodes and give rewards to user2
      await oxToken.approve(omegaDao.address, tokens('1000000'), { from: user2 })
      await omegaToken.approve(omegaDao.address, tokens('1000000'), { from: user2 })

      await omegaDao.mintNode(user2, tokens('100'), tokens('100'), 0, { from: user2 }) // 1 OM rewards
      await omegaDao.mintNode(user2, tokens('250'), tokens('250'), 1, { from: user2 }) // 3 OM rewards

      await omegaDao.payInterest({ from: owner })
    })

    it('redeemed value is correct', async () => {
      let accountForAddress = await omegaDao.accounts.call(user2)
      assert.equal(accountForAddress.iotaCount, 1)
      assert.equal(accountForAddress.lambdaCount, 1)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('4'))

      result = await omegaToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('650'), 'pool OM wallet balance correct after minting node')

      await omegaDao.widthrawInterest(user2, { from: user2 })

      accountForAddress = await omegaDao.accounts.call(user2)
      assert.equal(accountForAddress.interestAccumulated, 0)

      result = await omegaToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('654'), 'pool OM wallet balance correct after minting node')
    })

    it('can\'t redeem if there\'s nothing to redeem', async () => {
      let accountForAddress = await omegaDao.accounts.call(user2)
      assert.equal(accountForAddress.iotaCount, 1)
      assert.equal(accountForAddress.lambdaCount, 1)
      assert.equal(accountForAddress.phiCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('0'))

      result = await omegaToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('654'), 'pool OM wallet balance correct after minting node')

      try { await omegaDao.widthrawInterest(user2, { from: user2 }) }
      catch {}

      accountForAddress = await omegaDao.accounts.call(user2)
      assert.equal(accountForAddress.interestAccumulated, tokens('0'))

      result = await omegaToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('654'), 'pool OM wallet balance correct after minting node')
    })

    // trying to hack redeemable OM
  })
})
