import React, { useState, useEffect } from 'react'
import eventBus from './EventBus'

let xHealthPrice = 10, approved = false;

function Home(props) {
    // const [isApproved, setIsApproved] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [usdcBalance, setUSDCBalance] = useState(0)
    const [valueOfUSDC, setValueOfUSDC] = useState(0.0)
    const [xHealthBalance, setXHealthBalance] = useState(0)
    const [valueOfXHealth, setValueOfXHealth] = useState(0.0)

    let input_ref = React.createRef()

    const emitConnectWallet = () => {
        eventBus.dispatch('walletConnection', {})
    }
    
    const emitBuy = () => {
        if(approved === false) {
            props.approveUSDC()
            approved = true
            return
        } else {
            eventBus.dispatch('buyXHealth', {
                amount: valueOfXHealth
            })
        }
    }

    const emitAddTokenToWallet = () => {
        eventBus.dispatch('addTokenToWallet', {})
    }

    const onWallletConnected = () => {
        setIsConnected(true)
    }

    const onClick = () => {
        if(isNaN(valueOfUSDC)) {
            return
        }

        if(isConnected) {
            emitBuy()
        } else {
            emitConnectWallet()
        }
    }

    const onChange = (e) => {
        let value = parseFloat(e.target.value)
        setValueOfXHealth(isNaN(value) === true ? 0.000 : (value / xHealthPrice).toFixed(3))
        setValueOfUSDC(value)
    }

    const stateUpdated = (data) => {
        // setIsApproved(data.isApproved)
        setUSDCBalance(data.usdcBalance)
        setXHealthBalance(data.xHealthBalance)
    }

    useEffect(() => {
        eventBus.on('stateUpdated', (e) => {
            stateUpdated(e)
        })
        eventBus.on('walletConnected', () => {
            onWallletConnected()
        })
    }, [])

    return (
        <div>
            <header className="header-main">
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container-fluid alignment">
                        <a className="navbar-brand" href="/"><img src="images/logo.png" alt="" /></a>
                    </div>
                </nav>
            </header>

            <main className="hero-main">
                <section className="section hero-sec">
                    <div className="container-fluid alignment">
                        <div className="row align-items-center">
                            <div className="col-xl-6 col-md-12">
                                <h1>Welcome to the<br></br> presale of <span className="red-clr">xHEALTH</span>.</h1>
                                <p>Mint Clinics<span className="red-clr">.</span> Build Hospitals<span className="red-clr">.</span><br></br>Earn <span className="red-clr">xHEALTH</span></p>
                                <div className="hero-btns d-flex align-items-center">
                                    <a href="/" className="m-btn btn--primary">WHITEPAPER</a>
                                    <button className="m-btn btn--primary" onClick={() => input_ref.current.value=""} data-bs-toggle="modal" data-bs-target="#xHEALTHModal">Get $xHEALTH</button>
                                </div>
                            </div>
                            <div className="col-xl-6 col-md-12">
                                <div className="hero-img">
                                    <img src="images/hero-img.png" alt="hero-img" className="img-fluid" />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="dec-img">
                                    <img src="./images/plus.png" className="plus1" alt="dec-img" />
                                    <img src="./images/plus.png" className="plus2" alt="dec-img" />
                                    <img src="./images/plus.png" className="plus3" alt="dec-img" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="section footer-sec">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="footer-social-main">
                                <ul className="footer-links">
                                    <li className="footer-link">
                                        <a  href='https://twitter.com/' target="_blank" rel="noopener noreferrer">
                                            <img src="images/tw-ic.svg" alt="" />
                                        </a>
                                    </li>
                                    <li className="footer-link">
                                        <a  href='https://discord.org/' target="_blank" rel="noopener noreferrer">
                                            <img src="images/discord-ic.svg" alt="" />
                                        </a>
                                    </li>
                                    <li className="footer-link">
                                        <a  href='https://discord.org/' target="_blank" rel="noopener noreferrer">
                                            <img src="images/bi-ic.svg" alt="" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Modal */}
            <div className="modal fade modal-xHEALTH" id="xHEALTHModal" tabindex="-1" aria-labelledby="xHEALTHModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="xHEALTHModalLabel">BUY xHEALTH with USDC</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-input-txt">
                                <h6 className="light-font">From (estimated)</h6>
                                <h6 className="dark-font">Balance: { usdcBalance }</h6>
                            </div>
                            <div className="modal-input-from-main">
                                <input className='modal-input-form'
                                    onChange={(e) => onChange(e)}
                                    ref={ input_ref }
                                    type="text"
                                    placeholder='0.000' />
                                <div className="modal-input-right-txt">
                                    <img src="images/from-input-ic.png" className="img-fluid" alt="" />
                                    USDC
                                </div>
                            </div>
                            <div className="modal-input-txt">
                                <h6 className="light-font">To</h6>
                                <h6 className="dark-font">Balance: { xHealthBalance }</h6>
                            </div>
                            <div className="modal-input-from-main modal-input-to-main">
                                <div className="modal-input-left-txt">
                                    { valueOfXHealth }   
                                </div>
                                <div className="modal-input-right-txt">
                                    <img src="images/to-input-ic.png" className="img-fluid" alt="" />
                                    xHEALTH
                                </div>
                            </div>
                            <div className="modal-bottom-input-txt">
                                <h6 className="dark-font">Price</h6>
                                <h6 className="dark-font">10 USDC per xHEALTH</h6>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button"
                                className="btn btn-modal-footer"
                                onClick={() => onClick()}
                            >
                                { isConnected === false
                                    ? "Connect Wallet"
                                    : (approved === true ? "BUY" : "Approve USDC")
                                }
                            </button>
                            <div className="modal-footer-outside">
                                <button type="button"
                                    className="btn btn-modal-footer-outside"
                                    onClick={() => emitAddTokenToWallet()}
                                >
                                    Add xHEALTH to MetaMask
                                </button>
                            </div>
                        </div>
                    </div>        
                </div>
            </div>
            
        </div>
    )
}

export default Home