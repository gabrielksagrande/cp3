// components/ProposePartnership.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o arquivo CSS Module

const ProposePartnershipComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [name, setName] = useState('');
  const [initiatorCollection, setInitiatorCollection] = useState('');
  const [partnerCollection, setPartnerCollection] = useState('');
  const [terms, setTerms] = useState('');
  const [duration, setDuration] = useState(0);
  const [minSpending, setMinSpending] = useState(0); // Added minSpending state
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

  const proposePartnership = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = contractAddresses.contracts.creatorPartnershipManager;
    const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, signer);

    try {
      const tx = await contract.proposePartnership(
        name,
        initiatorCollection,
        partnerCollection,
        terms,
        duration,
        minSpending // Added minSpending parameter
      );
      await tx.wait();
      setStatus(`Partnership proposed successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error proposing partnership:', error);
      setStatus('Error proposing partnership');
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
      <h2>Propose Partnership</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.couponButton}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
          <label htmlFor="name">Name:</label>
          <input 
            id="name"
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Name" 
          />
          <label htmlFor="initiatorCollection">Initiator Coupon's name:</label>
          <input 
            id="initiatorCollection"
            type="text" 
            value={initiatorCollection} 
            onChange={(e) => setInitiatorCollection(e.target.value)} 
            placeholder="Initiator Coupon's name" 
          />
          <label htmlFor="partnerCollection">Partner Coupon's name:</label>
          <input 
            id="partnerCollection"
            type="text" 
            value={partnerCollection} 
            onChange={(e) => setPartnerCollection(e.target.value)} 
            placeholder="Partner Coupon's name" 
          />
          <label htmlFor="terms">Terms:</label>
          <input 
            id="terms"
            type="text" 
            value={terms} 
            onChange={(e) => setTerms(e.target.value)} 
            placeholder="Terms" 
          />
          <label htmlFor="duration">Duration (seconds):</label>
          <input 
            id="duration"
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))} 
            placeholder="Duration (seconds)" 
          />
          <label htmlFor="minSpending">Minimum Spending:</label>
          <input 
            id="minSpending"
            type="number" 
            value={minSpending} 
            onChange={(e) => setMinSpending(Number(e.target.value))} 
            placeholder="Minimum Spending" 
          />
          <button onClick={proposePartnership} className={styles.couponButton}>Propose</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default ProposePartnershipComponent;
