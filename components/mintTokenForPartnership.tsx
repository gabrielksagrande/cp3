// components/MintTokenForPartnership.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import contractAddresses  from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o arquivo CSS Module

const MintTokenForPartnershipComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [to, setTo] = useState(''); // Novo campo de entrada
  const [collectionName, setCollectionName] = useState('');
  const [amount, setAmount] = useState(0);
  const [partnershipId, setPartnershipId] = useState(0);
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

  const mintTokenForPartnership = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = contractAddresses.contracts.cp1;
    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.mintTokenForPartnership(
        to, // Adicionando o endereço de destino
        collectionName,
        amount,
        partnershipId
      );
      await tx.wait();
      setStatus(`Tokens minted successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error minting tokens for partnership:', error);
      setStatus('Error minting tokens for partnership');
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
      <h2>Mint Coupon for Partnership</h2>
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
          <div>
            <label htmlFor="partnershipId">Partnership ID:</label>
            <input 
              id="partnershipId"
              type="number" 
              value={partnershipId} 
              onChange={(e) => setPartnershipId(Number(e.target.value))} 
              placeholder="Partnership ID" 
            />
          </div>
          <button onClick={mintTokenForPartnership} className={styles.couponButton}>Mint</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default MintTokenForPartnershipComponent;