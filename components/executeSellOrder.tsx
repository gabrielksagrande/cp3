// components/ExecuteSellOrder.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

const ExecuteSellOrderComponent = ({ order }) => {
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);

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

  const executeSellOrder = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = '0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9';
    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.executeSellOrder(order.sellOrderCounter, order.amount);
      await tx.wait();
      setStatus(`Sell order executed successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error executing sell order:', error);
      setStatus('Error executing sell order');
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
      <h2>Execute Sell Order</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          {order && (
            <>
              <p>Seller: {order.seller}</p>
              <p>Collection Name: {order.collectionName}</p>
              <p>Token ID: {order.tokenId}</p>
              <p>Amount: {order.amount}</p>
              <p>Price: {order.price} cUSD</p>
              <p>Status: {order.status}</p>
              <p>Sell Order Counter: {order.sellOrderCounter}</p>
              <button onClick={executeSellOrder}>Execute Sell Order</button>
            </>
          )}
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default ExecuteSellOrderComponent;