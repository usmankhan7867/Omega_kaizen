require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
const owner = process.env.OWNER_WALLET
const provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)

UpdatePrice = {
  toWei: (n) => {
    return Web3.utils.toWei(n, 'ether')
  },
  toEth: (n) => {
    return Web3.utils.fromWei(n, 'ether')
  },
  setupOmegaIdo: async () => {
    artifact = require('../../../build/contracts/OmegaIdo.json')
    OmegaIdo = TruffleContract(artifact)
    OmegaIdo.setProvider(provider)
    return await OmegaIdo.deployed()
  },
  main: async () => {
    console.log('start')
    let ido = await UpdatePrice.setupOmegaIdo()
    await ido.updatePrice(100, { from: owner })
    console.log('done')
    process.exit()
  }
}

UpdatePrice.main()
