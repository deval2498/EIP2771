import React, { useEffect } from 'react'
import '../App.css';
import styled from 'styled-components'
import { useState } from 'react';
import {  Biconomy} from "@biconomy/mexa";
import { ethers } from 'ethers';
import SimpleStorage from '../contracts/SimpleStorage.sol/SimpleStorage.json'
import { useChain, useMoralis } from "react-moralis";
import { data } from 'autoprefixer';
let sigUtil = require("eth-sig-util");




const tokenAddress = '0x84519D02F60cc4C813EbCE6945831129b547ec78'
const ACCOUNT = 'e1c0812ab2cb8929e8cf2d58cc5d35c3f8dc91f90cb33713ce79791d91175164'
const userAddress = '0x2B099F96eaAd16A76127aEe391A301ec2782e3A9'


const Button = styled.button`
  background-color: black;
  color: white;
  font-size: 20px;
  padding: 10px 60px;
  border-radius: 5px;
  margin: 10px 0px;
  cursor: pointer;
  &:disabled {
    color: grey;
    opacity: 0.7;
    cursor: default;
  }
`;


const Input = () => {

  
    // Initialize Constants
const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" }
];
const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" }
];
// replace the chainId 42 if network is not kovan
let domainData = {
  name: "SimpleStorage",
  version: "1",
  chainId: "42",
  verifyingContract: tokenAddress
};
  
  
  let biconomy
  const [walletProvider,setWalletProvider] = useState()
  const [networkProvider,setNetworkProvider] = useState()
  let contractInterface = new ethers.utils.Interface(SimpleStorage.abi)
  const [store,setStore] = useState()
  const [provider,setProvider] = useState(new ethers.providers.JsonRpcProvider('https://kovan.infura.io/v3/0be322968c214906a231738f3f6729ef'));
  let userSigner = new ethers.Wallet(ACCOUNT,provider);
  const [contract,setContract] = useState(new ethers.Contract(tokenAddress,SimpleStorage.abi,userSigner))
  const { chainId } = useChain();
  useEffect(()=>{
    
    getStorageValue()
    
  },[chainId])

  async function connectProvider() {
    if(typeof window.ethereum !== 'undefined') {
     
      initializeBiconomy()
      console.log("clicked")
      
    }
      else
      console.log("Provider not connected")
  }
  
    const [name,setName] = useState()
    const handleChange = (event) => {
        setName(event.target.value)
    }
    const handleSubmit = (event) => {

        metaTransfer()
        console.log(name,"Submitted")
        event.preventDefault();
        
    }
    async function initializeBiconomy() {
      //condition for connecting wallet
      if(typeof window.ethereum !== "undefined" &&
      window.ethereum.isMetaMask){
        biconomy = new Biconomy(window.ethereum,{
          walletProvider: window.ethereum,
          apiKey: 'sFM90_gDo.55a0bc53-6873-497b-9f96-47c4f886bb64',
          debug: 'true',
        })
        setNetworkProvider(new ethers.providers.Web3Provider(biconomy))
        setWalletProvider(new ethers.providers.Web3Provider(window.ethereum))
        console.log(await biconomy.getSignerByAddress(userAddress).getAddress(),"Biconomy Object")
        
        console.log(contract,"Set Contract",walletProvider,"wallet",networkProvider,"network")
        biconomy
                .onEvent(biconomy.READY, async () => {
                    setContract(new ethers.Contract(tokenAddress,SimpleStorage.abi,biconomy.getSignerByAddress(userAddress)))
                    
                })
                .onEvent(biconomy.ERROR, (error, message) => {
                    console.log(error,"error")
                    console.log(message,"message")
                })
              }
              else{
                console.log("metamask not connected")
              }
    }
    async function metaTransfer() {
      console.log(contract,"Checking")
      let functionSignature = contractInterface.encodeFunctionData("setStorage", [name]);
      let nonce = await contract.getNonce(userAddress)
      console.log(nonce,"nonce")
      console.log(functionSignature,"Function Signature")
      let message = {};
      message.nonce = parseInt(nonce);
      message.from = userAddress;
      message.functionSignature = functionSignature;
      console.log(message,"Message")
      const dataToSign = JSON.stringify({
        types: {
          EIP712Domain: domainType,
          MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
      });
      console.log(contract,"Set Contract",walletProvider,"wallet",networkProvider,"network")
      let signature = await walletProvider.send("eth_signTypedData_v3", [userAddress, dataToSign])
      console.log(signature,"Signature")
      let { r, s, v } = getSignatureParameters(signature);
      let tx = contract.executeMetaTransaction(userAddress,
        functionSignature, r, s, v);
        await tx.wait(1);
        console.log("Transaction hash : ", tx.hash);
        getStorageValue();
    }
      
  async function getStorageValue() {
    console.log(contract,"Contract")
    setStore(await contract.getStorage())
  }    
                    
             
             
//////////
/*helper*/
const getSignatureParameters = signature => {
  if (!ethers.utils.isHexString(signature)) {
      throw new Error(
          'Given value "'.concat(signature, '" is not a valid hex string.')
      );
  }
  var r = signature.slice(0, 66);
  var s = "0x".concat(signature.slice(66, 130));
  var v = "0x".concat(signature.slice(130, 132));
  v = ethers.BigNumber.from(v).toNumber();
  if (![27, 28].includes(v)) v += 27;
  return {
      r: r,
      s: s,
      v: v
  };
};

              
            
  return (
    <div>
        <h2>Current Storage Value is:{store} </h2>
        <div className="field">
            <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Storage"
          onChange={handleChange}
        />
        <Button type = 'submit'>Store It</Button>
        </form>
      </div>
      <div>
      <Button onClick= {connectProvider}>Get Provider</Button>
      </div>
    </div>
  )
}

export default Input