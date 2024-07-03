// components/GetDetailedBalances.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

const GetDetailedBalancesComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState([]);
  const [timeLeftToExpire, setTimeLeftToExpire] = useState([]);
  const [collectionNames, setCollectionNames] = useState([]);
  const [collectionImages, setCollectionImages] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        }
      }
    };
    checkWalletConnection();
  }, []);

  const fetchBalances = async () => {
    if (!window.ethereum) {
      setStatus('Please install MetaMask!');
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract('0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9', cp1Abi, provider);

    try {
      const result = await contract.getDetailedBalances(address);
      setBalances(result[0]);
      setTimeLeftToExpire(result[1]);
      setCollectionNames(result[2]);
      setCollectionImages(result[3]);
      setStatus('Balances fetched successfully');
    } catch (error) {
      console.error('Error fetching balances:', error);
      setStatus('Error fetching balances');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const accounts = await provider.listAccounts();
      setAddress(accounts[0]);
      setIsConnected(true);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div>
      <h2>Detailed Balances</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <button onClick={fetchBalances}>Fetch Balances</button>
          {status && <p>{status}</p>}
          {balances.length === 0 ? (
            <p>No tokens found.</p>
          ) : (
            <ul>
              {balances.map((token, index) => (
                <li key={index}>
                  <p>Collection Name: {collectionNames[index]}</p>
                  <p>Token ID: {token.tokenId.toString()}</p>
                  <p>Amount: {token.amount.toString()}</p>
                  <p>Time Left to Expire: {timeLeftToExpire[index].toString()} minutes</p>
                  {collectionImages[index] && <img src={collectionImages[index]} alt={collectionNames[index]} width={100} />}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default GetDetailedBalancesComponent;
