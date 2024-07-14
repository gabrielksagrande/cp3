// components/GetAllBuyOrdersComponent.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const GetAllBuyOrdersComponent = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const contractAddress = contractAddresses.contracts.cp1;

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

  useEffect(() => {
    const fetchBuyOrders = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, cp1Abi, provider);
        const orders = await contract.getAllBuyOrders();
        const formattedOrders = orders.map(order => ({
          buyer: order.buyer,
          collectionName: order.collectionName,
          amount: order.amount.toNumber(),
          price: ethers.utils.formatUnits(order.price, 'ether'),
          status: order.status,
          buyOrderCounter: order.buyOrderCounter.toNumber()
        }));
        setBuyOrders(formattedOrders);
      }
    };
    fetchBuyOrders();
  }, [contractAddress]);

  const handleExecuteBuyOrder = async (order) => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.executeBuyOrder(order.buyOrderCounter, order.amount);
      await tx.wait();
      setStatus(`Buy order executed successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error executing buy order:', error);
      setStatus('Error executing buy order');
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
      <h2>All Buy Orders</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.coupon}>Connect Wallet</button>
      ) : (
        <div>
          {buyOrders.map((order, index) => (
            <div key={index} className={styles.coupon}>
              <p>Buyer: {order.buyer}</p>
              <p>Collection Name: {order.collectionName}</p>
              <p>Amount: {order.amount}</p>
              <p>Price: {order.price} cUSD</p>
              <p>Status: {order.status}</p>
              <p>Buy Order Counter: {order.buyOrderCounter}</p>
              <button onClick={() => handleExecuteBuyOrder(order)}>Execute Buy Order</button>
            </div>
          ))}
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default GetAllBuyOrdersComponent;
