import React from 'react';
import Web3 from 'web3';
import { constants } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import eventBus from './Components/EventBus';
import { tokenInfo, contractInfo } from './contractInfo'

import Home from './Components/Home';
// import './App.css';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

let web3, token, contract;

class Container extends React.Component {

  constructor() {
    super()

    this.state = {
      address: '',
      isConnected: false,
      usdcBalance: 0,
      xHealthBalance: 0,
    }

    this.buyXHealth = this.buyXHealth.bind(this)
    this.approveUSDC = this.approveUSDC.bind(this)
    this.connectWallet = this.connectWallet.bind(this)
    this.scanConnectedWallet = this.scanConnectedWallet.bind(this)
    this.displayNotification = this.displayNotification.bind(this)
  }

  async connectWallet() {
    if(this.state.isConnected === true) return

    if (window.ethereum) {
      (async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // await window.ethereum.request({
        //   method: 'wallet_switchEthereumChain',
        //   params: [{ chainId: '0x38' }]
        // });

        let accounts = await web3.eth.getAccounts();
        
        this.setState({
          address: accounts[0],
          isConnected: true
        })
        
        eventBus.dispatch('walletConnected', { 
          'address': accounts[0],
        })

        this.updateState()
      })()
    } else {
      alert('Install Metamask please.');
    }
  }

  scanConnectedWallet() {
    if(this.state.isConnected === true) return;

    web3.eth.getAccounts(async (err, accounts) => {
        if (err != null) {
            console.error("An error occurred: " + err)
        }
        else if (accounts.length !== 0 ) {
            this.setState({
              address: accounts[0],
              isConnected: true
            })

            eventBus.dispatch('walletConnected', { 
              'address': accounts[0],
            })
            
            this.updateState()
        }
    })
  }

  updateState = async () => {
    let allowlance = await token.methods.allowance(this.state.address, contractInfo.address).call()
    let usdcBalance = await token.methods.balanceOf(this.state.address).call()
    let xHealthBalance = await contract.methods.balanceOf(this.state.address).call()

    this.setState({
      ...this.state,
      usdcBalance,
      xHealthBalance,
      isApproved: (parseInt(allowlance) > 0 ? true : false)
    })
    eventBus.dispatch('stateUpdated', {
      usdcBalance: parseFloat(web3.utils.fromWei(usdcBalance, 'ether')).toFixed(3),
      xHealthBalance: parseFloat(web3.utils.fromWei(xHealthBalance, 'ether')).toFixed(3),
      isApproved: (parseInt(allowlance) > 0 ? true : false)
    })
  }

  async approveUSDC() {
    await token.methods.approve(contractInfo.address, constants.MaxUint256).send({
      from: this.state.address
    })
    this.updateState()
    return true
  }

  buyXHealth(xHealthAmount) {
    contract.methods.buyToken(this.state.address, web3.utils.toWei(xHealthAmount.toString(), 'ether')).send({
      from: this.state.address
    }).then(() => {
      this.displayNotification('success', `${xHealthAmount} xHEALTH added to your wallet successfully.`)
      this.updateState()
    }).catch(() => {
      this.displayNotification('error', `Transaction error.`)
    })
  }

  addTokenToWallet = async () => {
    if(!window.ethereum) return

    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: contractInfo.address,
          symbol: "xHEALTH",
          decimals: 18,
        },
      },
    });
  }

  displayNotification(appearance, text) {
    switch(appearance) {
        case 'warning':
            toast.warn(text); break
        case 'info':
            toast.info(text); break
        case 'error':
            toast.error(text); break
        case 'success':
            toast.success(text); break
        default: break
    }
  }

  componentDidMount() {
    if(window.ethereum) {
      web3 = new Web3(window.ethereum)
      token = new web3.eth.Contract(tokenInfo.abi, tokenInfo.address)
      contract = new web3.eth.Contract(contractInfo.abi, contractInfo.address)

      this.scanConnectedWallet()
    }

    eventBus.on('walletConnection', () => {
      this.connectWallet()
    })
    eventBus.on('buyXHealth', (data) => {
      this.buyXHealth(data.amount)
    })
    eventBus.on('addTokenToWallet', () => {
      this.addTokenToWallet()
    })

    if(window.ethereum) {
      window.ethereum.on('disconnect', () => { 
          window.location.reload();
      });
      window.ethereum.on('chainChanged', () => {
          window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
          window.location.reload();
      })
    }

    return () => {
      eventBus.remove('walletConnection', () => {
        this.connectWallet()
      })
      eventBus.remove('buyXHealth', (data) => {
        this.buyXHealth(data.amount)
      })
      eventBus.remove('addTokenToWallet', () => {
        this.addTokenToWallet()
      })
    }
  }

  render() {
    return (
      <div className="relative">
        <ToastContainer />
        <Home approveUSDC={this.approveUSDC} />
      </div>
    )
  }
}

function App() {

  return (
    <Container />
  );
}

export default App;
