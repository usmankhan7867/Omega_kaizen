Main = {
  loading: false,
  contracts: {},

  toEth: (n) => {
    let toEther = web3.utils.fromWei(n, 'ether')
    return toEther //.slice(0, 3) + '.' + toMilli.slice(3)
  },
  toWei: (n) => {
    return web3.utils.toWei(n, 'ether')
  },
  load: async () => {
    Main.toggleLoadingScreen(true)
    await Main.loadWeb3(true)

    $walletBtn = $('#wallet')
    $walletBtn.on('click', async () => {
      await Main.loadWeb3(false)
    })
    await Main.setupMetamaskEvents()
    await Main.setupClickPay()
    await Main.setupClickAddTokenToWallet()
    await Main.setupClickChangeNetwork()

    await Main.toggleLoadingScreen(false)
    console.log('loading done!')
  },
  toggleLoadingScreen: async (load) => {
    if(load) {
      $('.loading').show()
      $('.content').hide()
    }
    else {
      $('.loading').hide()
      $('.content').show()
    }
  },
  setupMetamaskEvents: async () => {
    if(typeof(ethereum) === 'undefined') { return }

    ethereum.on('accountsChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });

    ethereum.on('chainChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });
  },
  loadContract: async () => {

     // OM IDO contract on mainnet
    const omidoContractAddress = '0x8E06D7a384427c50795fBDc6a2d2f0169B9c2d14'
    const omegaIdo = await $.getJSON('contracts/OmegaIdo.json')
    Main.contracts.omegaIdo = TruffleContract(omegaIdo)
    Main.contracts.omegaIdo.setProvider(Main.web3Provider)

// OM contract on mainnet
const omContractAddress = '0x00D7299fC283ee52DCf4eb6Cc601F3EA0F87126C'
    const omega = await $.getJSON('contracts/Omega.json')
    Main.contracts.Omega = TruffleContract(omega)
    Main.contracts.Omega.setProvider(Main.web3Provider)

    // OX contract on mainnet
    // const oxContractAddress = '0xAC2f8fb059C96C481fAE3f4702Ca324664b79B26'
    // const ox = await $.getJSON('contracts/MainnetOx.json')
    // Main.contracts.Ox = TruffleContract(ox)
    // Main.contracts.Ox.setProvider(Main.web3Provider)

    // OX contract on testnet
       const oxContractAddress = '0x8976655C7A049AB6FcFC9123897AdDe13Ebef908'
       const ox = await $.getJSON('contracts/ExternalOx.json')
       Main.contracts.Ox = TruffleContract(ox)
       Main.contracts.Ox.setProvider(Main.web3Provider)

    // OX contract locally
    // const ox = await $.getJSON('contracts/Ox.json')
    // Main.contracts.Ox = TruffleContract(ox)
    // Main.contracts.Ox.setProvider(Main.web3Provider)

    try {
      //Main.omegaIdo = await Main.contracts.OmegaIdo.at(omidoContractAddress)
      //Main.omega = await Main.contracts.Omega.at(omContractAddress)
      
      // OX contract locally
      // Main.ox = await Main.contracts.Ox.deployed()

      // OX contract on testnet
       //  Main.ox = await Main.contracts.Ox.at(oxContractAddress)

      // OX contract on mainnet
      // Main.ox = await Main.contracts.Ox.at(oxContractAddress)
    }
    catch {
      $('#network-alert').show()
    }
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async (firstLoad) => {
    if (typeof web3 !== 'undefined') {
      Main.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      if(!firstLoad) { window.alert("Please connect to Metamask.") }
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        if(!firstLoad) { await ethereum.enable() }
      } catch {}
    }
    else if (window.web3) {
      Main.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
    }

    if(typeof web3 !== 'undefined'){ Main.accountConnected() }
  },
  accounts: async () => {
    const acc = await web3.eth.getAccounts()
    return acc
  },
  accountConnected: async () => {
    let accounts = await Main.accounts()
    if(accounts.length > 0) {
      Main.account = accounts[0]
      let acc = accounts[0]
      $('#wallet-content').html(acc.slice(0, 5) + '...' + acc.slice(acc.length - 4, acc.length))

      await Main.loadContract()
      await Main.fetchAccountData()
    }
  },
  fetchAccountData: async () => {
    oxBalance = await Main.ox.balanceOf(Main.account)
    $('#ox-balance').html(Main.toEth(oxBalance.toString()))

    let allowanceOx = await Main.ox.allowance(Main.account, Main.omegaIdo.address)
    if (typeof(Main.omegaIdo.address) == 'undefined') {
      Main.omegaIdo.address == '0x'
    }
    if(allowanceOx > 0) {
      $('#buy-omega').show()
    }
    else {
      $('#approve-ox').show()
    }
  },
  setupClickPay: async () => {
    $('#approve-ox').on('click', async (e) => {
      let amount = Main.toWei('100000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.ox.approve(Main.omegaIdo.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving OX token...')
        })
      })
    })

    $('#buy-omega').on('click', async (e) => {
      Main.buttonLoadingHelper(e, 'buying OM...', async () => {
        let omegaAmount = $('#input-omega').val()
        if(omegaAmount < 1){
          alert('You must purchase at least 1 OM token')
          return
        }
        omegaAmount = Main.toWei(omegaAmount.toString())
        await Main.omegaIdo.sellOmegaToken(Main.account, omegaAmount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Transfering OM to your wallet...')
        })
      })
    })

    $('#input-omega').on('keyup', async (e) => {
      let omegaPrice = await Main.omegaIdo.pricePerOmegaPercent()
      omegaPrice = parseFloat(omegaPrice.toString()) / 100
      let inputVal = parseFloat($(e.target).val())
      $('#ox-value').html(omegaPrice * inputVal)
    })
  },
  setupClickAddTokenToWallet: async () => {
    $('#add-token').on('click', async (e) => {
      Main.addTokenToWallet()
    })
  },
  addTokenToWallet: async () => {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: Main.omega.address, 
          symbol: 'OM', 
          decimals: 18 
        }
      }
    })
  },
  setupClickChangeNetwork: async () => {
    $('#change-network').on('click', async (e) => {
      Main.changeWalletNetwork()
    })
  },

  // Mainnet BSC

  //changeWalletNetwork: async () => {
  //  await ethereum.request({
  //    method: 'wallet_switchEthereumChain',
  //    params:[ { chainId: '0x38' } ]
  //  });

  // TestNet BSC

    changeWalletNetwork: async () => {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params:[ { chainId: '0x61' } ]
      });
  },

  // helper functions
  buttonLoadingHelper: async (event, loadingText, callback) => {
    $btn = $(event.target)
    $btn.attr('disabled', 'disabled')
    $btn.html(loadingText)

    try {
      await callback()
    } catch {
      alert('There was a problem. Please check the values you inputed and try again.')
      window.location.reload()
    }
    window.location.reload()
  },
  handleTransaction: async (txHash, message) => {
    $('#create-node').modal('hide')
    $modal = $('#tx-alert')
    $modal.find('#tx-link').attr('href', 'https://bscsan.com/tx/' + txHash)
    $modal.find('#tx-message').html(message)
    $modal.modal('show')
  },
}

$(() => {
  $(window).load(() => { Main.load() })
})
