// components/OpenSellOrder.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

const OpenSellOrderComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);

  const [collectionName, setCollectionName] = useState('');
  const [tokenId, setTokenId] = useState(0);
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

  const openSellOrder = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = '0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9';
    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.openSellOrder(
        collectionName,
        tokenId,
        ethers.utils.parseUnits(price.toString(), 'ether'),
        amount
      );
      await tx.wait();
      setStatus(`Sell order opened successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error opening sell order:', error);
      setStatus('Error opening sell order');
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
      <h2>Open Sell Order</h2>
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
            value={tokenId} 
            onChange={(e) => setTokenId(Number(e.target.value))} 
            placeholder="Token ID" 
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
          <button onClick={openSellOrder}>Open Sell Order</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default OpenSellOrderComponent;
