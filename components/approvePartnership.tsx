// components/ApprovePartnership.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

const ApprovePartnershipComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const [partnershipId, setPartnershipId] = useState(0);
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

  const approvePartnership = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, signer);

    try {
      const tx = await contract.approvePartnership(partnershipId);
      await tx.wait();
      setStatus(`Partnership approved successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error approving partnership:', error);
      setStatus('Error approving partnership');
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
      <h2>Approve Partnership</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.coupon}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
        <label htmlFor="number">Partnership ID:</label>

          <input 
            type="number" 
            value={partnershipId} 
            onChange={(e) => setPartnershipId(Number(e.target.value))} 
            placeholder="Partnership ID" 
          />
          <button onClick={approvePartnership}>Approve</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default ApprovePartnershipComponent;