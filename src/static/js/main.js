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

    await Main.setupClickCollect()
    await Main.setupClickMintNode()
    $walletBtn = $('#wallet')
    $walletBtn.on('click', async () => {
      await Main.loadWeb3(false)
    })

    await Main.setupClickProvideOmega()
    await Main.setupClickProvideOx()
    await Main.setupClickApproveOx()
    await Main.setupMetamaskEvents()
    await Main.setupClickAddTokenToWallet()
    await Main.setupClickChangeNetwork()

    $('#max-omega').on('click', Main.maxOmegaBtn)
    $('#max-ox').on('click', Main.maxOxBtn)
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
    const omegaDao = await $.getJSON('contracts/OmegaDao.json')
    Main.contracts.OmegaDao = TruffleContract(omegaDao)
    Main.contracts.OmegaDao.setProvider(Main.web3Provider)

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
     // Main.omegaDao = await Main.contracts.OmegaDao.deployed()
     // Main.omega = await Main.contracts.Omega.deployed()

      // OX contract locally
      // Main.ox = await Main.contracts.Ox.deployed()

      // OX contract on testnet
      Main.ox = await Main.contracts.Ox.at(oxContractAddress)

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
      await Main.fetchGeneralData()
    }
  },
  fetchGeneralData: async () => {
    let totalNodes = await Main.omegaDao.totalNodes.call()
    $('#total-nodes').html(totalNodes.toString())

    let contractAccount = await Main.omegaDao.accounts(Main.account)
    let total = contractAccount.iotaCount.toNumber() * 200
    total += contractAccount.lambdaCount.toNumber() * 500
    total += contractAccount.phiCount.toNumber() * 1000
    total += contractAccount.chiliaCount.toNumber() * 2000
    total += contractAccount.tabithaCount.toNumber() * 10000
    $('#tlv').html('$' + total.toLocaleString('us'))

    let omegaPool = await Main.omega.balanceOf(Main.omegaDao.address)
    let formatedPoolAmount = parseInt(Main.toEth(omegaPool))
    $('#omega-pool').html(formatedPoolAmount.toLocaleString('us'))
    $('#ox-pool').html((total / 2).toLocaleString('us'))
  },
  fetchAccountData: async () => {
    // number of nodes
    let contractAccount = await Main.omegaDao.accounts(Main.account)
    let total = contractAccount.iotaCount.toNumber() + contractAccount.lambdaCount.toNumber() + contractAccount.phiCount.toNumber() +
      contractAccount.chiliaCount.toNumber() + contractAccount.tabithaCount.toNumber()

    let totalRewards = contractAccount.iotaCount.toNumber() * 1 + contractAccount.lambdaCount.toNumber() * 3 + contractAccount.phiCount.toNumber() * 7 +
      contractAccount.chiliaCount.toNumber() * 16 + contractAccount.tabithaCount.toNumber() * 100

    $('#iota-count').html(contractAccount.iotaCount.toNumber())
    $('#iota-rewards').html(contractAccount.iotaCount.toNumber() * 1)

    $('#lambda-count').html(contractAccount.lambdaCount.toNumber())
    $('#lambda-rewards').html(contractAccount.lambdaCount.toNumber() * 3)

    $('#chilia-count').html(contractAccount.phiCount.toNumber())
    $('#chilia-rewards').html(contractAccount.phiCount.toNumber() * 7)

    $('#chilia-count').html(contractAccount.chiliaCount.toNumber())
    $('#chilia-rewards').html(contractAccount.chiliaCount.toNumber() * 16)

    $('#tabitha-count').html(contractAccount.tabithaCount.toNumber())
    $('#tabitha-rewards').html(contractAccount.tabithaCount.toNumber() * 100)

    $('#total-count').html(total)
    $('#total-rewards').html(totalRewards)

    $('#num-nodes').html(total)

    // rewards accumulated
    let interestAccumulated = Main.toEth(contractAccount.interestAccumulated)
    $('#accumulated-interest').html(interestAccumulated + ' OM')

    if(parseFloat(interestAccumulated) == 0){
      $('#collect-omega').attr('disabled', 'disabled')
    }

    // wallet amount of OM
    omegaBalance = await Main.omega.balanceOf(Main.account)
    $('#omega-balance').html(Main.toEth(omegaBalance.toString()))

    // wallet amount of OX
    oxBalance = await Main.ox.balanceOf(Main.account)
    $('#ox-balance').html(Main.toEth(oxBalance.toString()))

    let allowanceOmega = await Main.omega.allowance(Main.account, Main.omegaDao.address)
    let allowanceOx = await Main.ox.allowance(Main.account, Main.omegaDao.address)

    if(allowanceOx > 0 && allowanceOmega > 0) {
      $('#collect-omega').show()
      $('#node-type-modal').show()
    }
    else if(allowanceOx == 0 && allowanceOmega > 0) {
      $('#collect-omega').show()
      $('#approve-ox').show()
      $('#approve-modal').show()
    }
    else if(allowanceOx > 0 && allowanceOmega == 0) {
      $('.approve-omega').show()
      $('#approve-modal').show()
    }
    else {
      $('#approve-ox').show()
      $('.approve-omega').show()
      $('#approve-modal').show()
    }

    $('#node-modal').removeAttr('disabled')
  },
  setupClickCollect: async () => {
    $('.approve-omega').on('click', async (e) => {
      let amount = Main.toWei('1000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.omega.approve(Main.omegaDao.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving OM token...')
        })
      })
    })

    $('#collect-omega').on('click', async (e) => {
      Main.buttonLoadingHelper(e, 'collecting...', async () => {
        await Main.omegaDao.widthrawInterest(Main.account, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Collecting OM to your wallet...')
        })
      })
    })
  },
  setupClickProvideOmega: async () => {
    $('#provide-omega').on('click', async () => {
      let currentBalence = parseInt(Main.toEth(omegaBalance.toString()))
      let amountToProvide = parseInt($('#provide-omega').data('amount'))

      if(currentBalence >= amountToProvide){
        $('#input-omega').val(amountToProvide)
      }
    })
  },
  setupClickProvideOx: async () => {
    $('#provide-ox').on('click', async () => {
      let currentBalence = parseInt(Main.toEth(oxBalance.toString()))
      let amountToProvide = parseInt($('#provide-ox').data('amount'))

      if(currentBalence >= amountToProvide){
        $('#input-ox').val(amountToProvide)
      }
    })
  },
  setupClickApproveOx: async () => {
    $('#approve-ox').on('click', async (e) => {
      let amount = Main.toWei('100000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.ox.approve(Main.omegaDao.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving OX token...')
        })
      })
    })
  },
  setupClickMintNode: async () => {
    let omegaType, tokensVals

    $('#next-step-modal').on('click', async (e) => {
      omegaType = $('#omega-type').val()

      switch(omegaType) {
        case '0':
          tokensVals = 100
          break;
        case '1':
          tokensVals = 250
          break;
        case '2':
          tokensVals = 500
          break;
        case '3':
          tokensVals = 1000
          break;
        case '4':
          tokensVals = 5000
          break;
        default:
          alert('Something went wrong!')
      }

      $('#input-omega').attr('placeholder', tokensVals + ' OM')
      $('#provide-omega').attr('data-amount', tokensVals)
      $('#input-ox').attr('placeholder', tokensVals + ' OX')
      $('#provide-ox').attr('data-amount', tokensVals)
      $('.token-vals').html(tokensVals)
      $('#mint-node').attr('data-amount', tokensVals)
      $('#mint-node').attr('data-omega-type', omegaType)

      $('#node-type-modal').hide()
      $('#mint-modal').show()
    })

    $('#mint-node').on('click', async (e) => {
      let omegaAmount = $('#input-omega').val()
      let oxAmount = $('#input-ox').val()
      let amountToProvide = $(e.target).data('amount')
      let omegaType = $(e.target).data('omega-type')

      if(omegaAmount < amountToProvide || oxAmount < amountToProvide){
        alert('You need to provide ' + amountToProvide + ' OM and ' + amountToProvide + ' OX to mint a node')
        return
      }

      Main.buttonLoadingHelper(e, 'minting...', async () => {
        await Main.omegaDao.mintNode(
          Main.account,
          Main.toWei(omegaAmount),
          Main.toWei(oxAmount),
          omegaType,
          { from: Main.account }
        ).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Minting Omega node...')
        })
      })
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
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: Main.omega.address, // The address that the token is at.
          symbol: 'OM', // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18 // The number of decimals in the token
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

// Testnet BSC

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
      alert('Something went wrong, please refresh and try again.')
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
  }
}

$(() => {
  $(window).load(() => { Main.load() })
})
