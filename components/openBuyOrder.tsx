// components/OpenBuyOrder.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

const OpenBuyOrderComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);

  const [collectionName, setCollectionName] = useState('');
  const [price, setPrice] = useState(0);
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

  const openBuyOrder = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = '0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9';
    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.openBuyOrder(
        collectionName,
        ethers.utils.parseUnits(price.toString(), 'ether'),
        amount
      );
      await tx.wait();
      setStatus(`Buy order opened successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error opening buy order:', error);
      setStatus('Error opening buy order');
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
    <div>
      <h2>Open Buy Order</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <input 
            type="text" 
            value={collectionName} 
            onChange={(e) => setCollectionName(e.target.value)} 
            placeholder="Collection Name" 
          />
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(Number(e.target.value))} 
            placeholder="Price" 
          />
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            placeholder="Amount" 
          />
          <button onClick={openBuyOrder}>Open Buy Order</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default OpenBuyOrderComponent;