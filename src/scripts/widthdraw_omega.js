require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xe17634De704a77A44f6957F40499CbfBc187ecb6' // owner testnet
const owner = process.env.OWNER_WALLET

WidthrawOmega = {
  toWei: (n) => {
    return Web3.utils.toWei(n, 'ether')
  },
  setup: async () => {
    provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)
    omegaDaoArtifact = require('../../build/contracts/OmegaDao.json')
    OmegaDao = TruffleContract(omegaDaoArtifact)
    OmegaDao.setProvider(provider)
    return await OmegaDao.deployed()
  },
  main: async (to, amount) => {
    console.log('start')
    let contract = await WidthrawOmega.setup()
    await contract.burnOmega(to, amount, { from: owner } )
    console.log('done')
    process.exit()
  }
}

let to = process.argv[2].toString()
let amount = process.argv[3].toString()
amount = WidthrawOmega.toWei(amount)

WidthrawOmega.main(to, amount)
