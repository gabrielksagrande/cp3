// components/CreateCollection.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import contractAddresses  from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const CreateCollectionComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [validityMinutes, setValidityMinutes] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [status, setStatus] = useState('');
  const contractAddress = contractAddresses.contracts.cp1;

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

  const createCollection = async () => {
    if (!signer) {
      setStatus('Por favor, conecte sua carteira.');
      return;
    }

    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.createCollection(
        collectionName,
        description,
        image,
        validityMinutes,
        suggestedPrice // Não multiplica por 1e18 aqui
      );
      await tx.wait();
      setStatus(`Coleção criada com sucesso: ${tx.hash}`);
    } catch (error) {
      console.error('Erro ao criar coleção:', error);
      setStatus('Erro ao criar coleção');
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
      <h2>Create Coupon</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.coupon}>Conect wallet</button>
      ) : (
        <div className={styles.coupon}>
          <div>
            <label htmlFor="collectionName">Coupon's name:</label>
            <input 
              id="collectionName"
              type="text" 
              value={collectionName} 
              onChange={(e) => setCollectionName(e.target.value)} 
              placeholder="Coupon's name" 
            />
          </div>
          <div>
            <label htmlFor="description">Description and conditions:</label>
            <input 
              id="description"
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Description" 
            />
          </div>
          <div>
            <label htmlFor="image">Image URL:</label>
            <input 
              id="image"
              type="text" 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
              placeholder="Image URL" 
            />
          </div>
          <div>
            <label htmlFor="validityMinutes">Validity in minutes:</label>
            <input 
              id="validityMinutes"
              type="number" 
              value={validityMinutes} 
              onChange={(e) => setValidityMinutes(Number(e.target.value))} 
              placeholder="Validity in minuts" 
            />
          </div>
          <div>
            <label htmlFor="suggestedPrice">Sugested price:</label>
            <input 
              id="suggestedPrice"
              type="number" 
              value={suggestedPrice} 
              onChange={(e) => setSuggestedPrice(Number(e.target.value))} 
              placeholder="Sugested price" 
            />
          </div>
          <button onClick={createCollection}>Create</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default CreateCollectionComponent;