// Mock OX Token -- just developement
// const Ox = artifacts.require("Ox");

const Omega = artifacts.require("Omega");
const OmegaDao = artifacts.require("OmegaDao");
const OmegaIdo = artifacts.require("OmegaIdo");
const Web3 = require('web3')

function toWei(n) {
  return Web3.utils.toWei(n, 'ether')
}

function toEth(n) {
  return Web3.utils.fromWei(n, 'ether')
}

module.exports = async function (deployer, network, accounts) {
  const team = [
    '0xe17634De704a77A44f6957F40499CbfBc187ecb6',
    '0x1B408886aBBDfdBDC0CC5FFF2D0E982E593F4672'
  ]

  // Mock OX Token -- testnet
     const oxContractAddress = '0x8976655C7A049AB6FcFC9123897AdDe13Ebef908'

  // Mock OX Token -- localhost
  // await deployer.deploy(Ox)
  // const oxToken = await Ox.deployed()

  // Mainnet OX Token
  // const oxContractAddress = '0xAC2f8fb059C96C481fAE3f4702Ca324664b79B26'

  // Deploy OM Token
  await deployer.deploy(Omega)
  const omegaToken = await Omega.deployed()

  // Deploy omegaDao
  await deployer.deploy(OmegaDao, omegaToken.address, oxContractAddress, team)
  const omegaDao = await OmegaDao.deployed()

  await omegaToken.setDaoContract(omegaDao.address)

  // Deploy omegaIDO
  let pricePerOmega = 50 // 0.5 OX per OM
  await deployer.deploy(OmegaIdo, omegaToken.address, oxContractAddress, pricePerOmega)
  const omegaIdo = await OmegaIdo.deployed()

  // Move half OM tokens to the omegaIdo and omegaDao
  let omegaBalance = await omegaToken.balanceOf(accounts[0])
  let halfBalance = toWei((parseInt(toEth(omegaBalance)) / 2).toString())
  await omegaToken.transfer(omegaIdo.address, halfBalance)
  await omegaToken.transfer(omegaDao.address, halfBalance)

  await omegaToken.setTranferLimit(toWei('100000')) // Set transfer limit to 10k OM

  // transfer OX balance to owner -- just developement
  // oxBalance = await oxToken.balanceOf(accounts[0])
  // await oxToken.transfer(omegaIdo.address, oxBalance.toString())
};
