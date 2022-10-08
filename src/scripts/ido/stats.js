require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xe17634De704a77A44f6957F40499CbfBc187ecb6' // owner testnet
const owner = process.env.OWNER_WALLET
const provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)

Stats = {
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
  setupOmegaToken: async () => {
    artifact = require('../../../build/contracts/Omega.json')
    Omega = TruffleContract(artifact)
    Omega.setProvider(provider)
    return await Omega.deployed()
  },

  // setupOxToken: async () => {
  //   artifact = require('../../../build/contracts/Ox.json')
  //   Ox = TruffleContract(artifact)
  //   Ox.setProvider(provider)
  //   return await Ox.deployed()
  // },

  main: async () => {
    console.log('start')
    let ido = await Stats.setupOmegaIdo()
    let omega = await Stats.setupOmegaToken()
    // let ox = await Stats.setupOxToken()


    // OX contract on testnet
      const oxContractAddress = '0x8976655C7A049AB6FcFC9123897AdDe13Ebef908'


    // OX contract on mainnet
    // const oxContractAddress = '0xAC2f8fb059C96C481fAE3f4702Ca324664b79B26'

    let oxArtifact = require('../../../build/contracts/MainnetOx.json')
    Ox = TruffleContract(oxArtifact)
    Ox.setProvider(provider)
    let ox = await Ox.at(oxContractAddress)

    console.log('IDO contract address: ' + ido.address)
    console.log('OM contract address: ' + omega.address)
    console.log('OX contract address: ' + ox.address)

    let amountOx = await ox.balanceOf(ido.address)
    console.log('OX in IDO contract: ' + Stats.toEth(amountOx.toString()))

    let amountOmega = await omega.balanceOf(ido.address)
    console.log('OM in IDO contract: ' + Stats.toEth(amountOmega.toString()))

    let omegaPrice = await ido.pricePerOmegaPercent.call()
    console.log('OM price in IDO: ' + omegaPrice.toString())

    console.log('done')
    process.exit()
  }
}

Stats.main()
