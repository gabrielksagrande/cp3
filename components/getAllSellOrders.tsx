// components/GetAllSellOrders.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import cUSDAbi from './cUSDAbi.json'; // Certifique-se de ter o ABI para cUSD

const GetAllSellOrdersComponent = () => {
  const [sellOrders, setSellOrders] = useState([]);
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

    const fetchSellOrders = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract('0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9', cp1Abi, provider);
        const orders = await contract.getAllSellOrders();
        const formattedOrders = orders.map(order => ({
          seller: order.seller,
          collectionName: order.collectionName,
          tokenId: order.tokenId.toNumber(),
          amount: order.amount.toNumber(),
          price: ethers.utils.formatUnits(order.price, 'ether'),
          status: order.status,
          sellOrderCounter: order.sellOrderCounter.toNumber()
        }));
        setSellOrders(formattedOrders);
      }
    };
    fetchSellOrders();
  }, []);

  const approvecUSD = async (amount) => {
    if (!signer) return;
    const cUSDAddress = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
    const cUSDContract = new ethers.Contract(cUSDAddress, cUSDAbi, signer);
    const tx = await cUSDContract.approve('0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9', amount);
    await tx.wait();
  };

  const executeSellOrder = async (order) => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    try {
      const amount = ethers.utils.parseUnits(order.price.toString(), 'ether').mul(order.amount);
      await approvecUSD(amount);

      const contractAddress = '0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9';
      const contract = new ethers.Contract(contractAddress, cp1Abi, signer);
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
      <h2>All Sell Orders</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <ul>
            {sellOrders.map((order, index) => (
              <li key={index}>
                <p>Seller: {order.seller}</p>
                <p>Collection Name: {order.collectionName}</p>
                <p>Token ID: {order.tokenId}</p>
                <p>Amount: {order.amount}</p>
                <p>Price: {order.price} cUSD</p>
                <p>Status: {order.status}</p>
                <p>Sell Order Counter: {order.sellOrderCounter}</p>
                <button onClick={() => executeSellOrder(order)}>Execute Sell Order</button>
              </li>
            ))}
          </ul>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default GetAllSellOrdersComponent;
