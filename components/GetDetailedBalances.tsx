// components/GetDetailedBalances.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o arquivo CSS Module

const GetDetailedBalancesComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState([]);
  const [timeLeftToExpire, setTimeLeftToExpire] = useState([]);
  const [collectionNames, setCollectionNames] = useState([]);
  const [collectionImages, setCollectionImages] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [suggestedPrices, setSuggestedPrices] = useState([]);
  const [status, setStatus] = useState('');
  const contractAddress = contractAddresses.contracts.cp1;

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
    const contract = new ethers.Contract(contractAddress, cp1Abi, provider);

    try {
      const result = await contract.getDetailedBalances(address);
      setBalances(result[0]);
      setTimeLeftToExpire(result[1]);
      setCollectionNames(result[2]);
      setCollectionImages(result[3]);
      setDescriptions(result[4]);
      setSuggestedPrices(result[5]);
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
    <div className={styles.couponContainer}>
      <h2>Detailed Balances</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.couponButton}>Connect Wallet</button>
      ) : (
        <>
          <button onClick={fetchBalances} className={styles.couponButton}>Fetch Balances</button>
          {status && <p>{status}</p>}
          {balances.length === 0 ? (
            <p>No tokens found.</p>
          ) : (
            <div>
              {balances.map((token, index) => (
                <div key={index} className={styles.coupon}>
                  <h2>Balance Details</h2>
                  <p>Coupon's Name: {collectionNames[index]}</p>
                  <p>Token ID: {token.tokenId.toString()}</p>
                  <p>Amount: {token.amount.toString()}</p>
                  <p>Time Left to Expire: {timeLeftToExpire[index].toString()} minutes</p>
                  <p>Description: {descriptions[index]}</p>
                  <p>Suggested Price: {ethers.utils.formatUnits(suggestedPrices[index], 'ether')} cUSD</p>
                  {collectionImages[index] && <img src={collectionImages[index]} alt={collectionNames[index]} width={100} />}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GetDetailedBalancesComponent;