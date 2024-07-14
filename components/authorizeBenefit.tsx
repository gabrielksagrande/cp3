// components/AuthorizeBenefit.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

const AuthorizeBenefitComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const [partnershipId, setPartnershipId] = useState(0);
  const [beneficiary, setBeneficiary] = useState('');
  const [spending, setSpending] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
          setSigner(provider.getSigner());
        }
      }
    };
    checkWalletConnection();
  }, []);

  const authorizeBenefit = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, signer);

    try {
      const tx = await contract.authorizeBenefit(partnershipId, beneficiary, spending);
      await tx.wait();
      setStatus(`Benefit authorized successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error authorizing benefit:', error);
      setStatus('Error authorizing benefit');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      setAddress(accounts[0]);
      setSigner(signer);
      setIsConnected(true);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div className={styles.couponContainer}>
      <h2>Authorize Benefit</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.coupon}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
          <div>
            <label htmlFor="partnershipId">Partnership ID:</label>
            <input 
              id="partnershipId"
              type="number" 
              value={partnershipId} 
              onChange={(e) => setPartnershipId(Number(e.target.value))} 
              placeholder="Enter Partnership ID" 
            />
          </div>
          <div>
            <label htmlFor="beneficiary">Beneficiary Address:</label>
            <input 
              id="beneficiary"
              type="text" 
              value={beneficiary} 
              onChange={(e) => setBeneficiary(e.target.value)} 
              placeholder="Enter Beneficiary Address" 
            />
          </div>
          <div>
            <label htmlFor="spending">Spending Amount:</label>
            <input 
              id="spending"
              type="number" 
              value={spending} 
              onChange={(e) => setSpending(Number(e.target.value))} 
              placeholder="Enter Spending Amount" 
            />
          </div>
          <button onClick={authorizeBenefit}>Authorize</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default AuthorizeBenefitComponent;
