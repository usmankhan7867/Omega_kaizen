require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 9545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      provider: () => new HDWalletProvider('ready occur fade food bless illegal game hunt renew twice exit unfold', 'http://127.0.0.1:9545')
    },
    bsc_testnet: {
      provider: () => new HDWalletProvider(process.env.TESTNET_PRIVATE_KEY, process.env.TESTNET_HOST_URI),
      network_id: 97,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 6000000,
      gasPrice: 10000000000,
    },
    bsc_mainnet: {
      provider: () => new HDWalletProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_HOST_URI),
      network_id: 56,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 650000000000, // gasPrice: 650 Gwei
      // gas: 8500000, // default: 6700000
    },
  },
  compilers: {
    solc: {
      version: "0.8.10",
    }
  },
};
