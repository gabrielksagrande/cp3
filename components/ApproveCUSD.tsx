import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import IERC20Abi from './cUSDAbi.json'; // ABI do contrato IERC20 para o token cUSD
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const ApproveCUSDComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
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

  const approveCUSD = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }
    const spender = contractAddresses.contracts.cp1;
    const cUSDAddress = contractAddresses.contracts.cUSD; // Endereço do contrato cUSD
    const contract = new ethers.Contract(cUSDAddress, IERC20Abi, signer);

    try {
      const tx = await contract.approve(spender, ethers.utils.parseUnits(amount.toString(), 18));
      await tx.wait();
      setStatus(`Approval successful: ${tx.hash}`);
    } catch (error) {
      console.error('Error approving CUSD:', error);
      setStatus('Error approving CUSD');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      setSigner(signer);
      setIsConnected(true);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div className={styles.couponContainer}>
      <h2>Approve CUSD</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.coupon}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
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
          <button onClick={approveCUSD}>Approve</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default ApproveCUSDComponent;
