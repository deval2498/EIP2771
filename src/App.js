import logo from './logo.svg';
import './App.css';
import React from 'react';
import { useMoralis } from "react-moralis";
import styled from 'styled-components'
import Header from './components/Header'
import { useEffect, useState } from 'react';
import Input from './components/Input'

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

function App() {



  const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();
  const [address,setAddress] = useState()
  useEffect(async ()=>{
    if(isAuthenticated){
    setAddress(account)
    console.log(account,"account app.js")
    }
    else{
      setAddress("Connect Metamask")
    }
  },[account])
  const login = async () => {
    

      await authenticate({signingMessage: "Log in using Moralis" })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user.get("ethAddress"));
          console.log(account,"account func")
          setAddress(user.get("ethAddress"))
        })
        .catch(function (error) {
          console.log(error);
        });
    
  }

  const logOut = async () => {
    await logout();
    console.log("logged out");
  }
  return (
    <div>
      <div className="App">
    <Header address={address}/>
  </div>
    <div className="App">
      <Button onClick={login} disabled={isAuthenticating}>Connect Wallet</Button>
      <Button onClick={logOut} disabled={isAuthenticating}>logout</Button>
    </div>
      <div className="App">
      <Input/>
      </div>
    </div>
  );
}

export default App;
