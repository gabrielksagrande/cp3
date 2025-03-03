// components/MintToken.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import contractAddresses  from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o arquivo CSS Module

const MintTokenComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [to, setTo] = useState(''); // Novo campo de entrada
  const [collectionName, setCollectionName] = useState('');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setSigner(provider.getSigner());
        }
      }
    };
    checkWalletConnection();
  }, []);

  const mintToken = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = contractAddresses.contracts.cp1;
    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.mintToken(
        to, // Adicionando o endereço de destino
        collectionName,
        amount
      );
      await tx.wait();
      setStatus(`Token minted successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error minting token:', error);
      setStatus('Error minting token');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      setSigner(signer);
      setIsConnected(true);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div className={styles.couponContainer}>
      <h2>Mint Coupon</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.couponButton}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
          <div>
            <label htmlFor="to">To (Recipient Address):</label>
            <input 
              id="to"
              type="text" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              placeholder="Recipient Address" 
            />
          </div>
          <div>
            <label htmlFor="collectionName">Coupon's Name:</label>
            <input 
              id="collectionName"
              type="text" 
              value={collectionName} 
              onChange={(e) => setCollectionName(e.target.value)} 
              placeholder="Coupon's Name" 
            />
          </div>
          <div>
            <label htmlFor="amount">Amount:</label>
            <input 
              id="amount"
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))} 
              placeholder="Amount" 
            />
          </div>
          <button onClick={mintToken} className={styles.couponButton}>Mint</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default MintTokenComponent;