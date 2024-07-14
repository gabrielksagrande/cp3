import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const AddPartnerComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const [partnershipId, setPartnershipId] = useState(0);
  const [partnerCollection, setPartnerCollection] = useState('');
  const [status, setStatus] = useState('');
  const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

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

  const addPartner = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, signer);

    try {
      const tx = await contract.addPartner(partnershipId, partnerCollection);
      await tx.wait();
      setStatus(`Partner added successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error adding partner:', error);
      setStatus('Error adding partner');
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
      <h2>Add Partner</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
          <label htmlFor="number">Partnership ID:</label>
          <input 
            type="number" 
            value={partnershipId} 
            onChange={(e) => setPartnershipId(Number(e.target.value))} 
            placeholder="Partnership ID" 
          />
          <input 
            type="text" 
            value={partnerCollection} 
            onChange={(e) => setPartnerCollection(e.target.value)} 
            placeholder="Partner Collection" 
          />
          <button onClick={addPartner}>Add Partner</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default AddPartnerComponent;
