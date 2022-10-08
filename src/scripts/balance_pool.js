require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xe17634De704a77A44f6957F40499CbfBc187ecb6' // owner testnet
const owner = process.env.OWNER_WALLET

BalancePool = {
  setup: async () => {
    provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)
    omegaDaoArtifact = require('../../build/contracts/OmegaDao.json')
    OmegaDao = TruffleContract(omegaDaoArtifact)
    OmegaDao.setProvider(provider)
    return await OmegaDao.deployed()
  },
  main: async () => {
    // debug with: console.log(transaction.receipt)
    console.log('start')
    let contract = await BalancePool.setup()
    await contract.balancePool({ from: owner })
    console.log('done')
    process.exit()
  }
}

BalancePool.main()
