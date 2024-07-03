// components/MintTokenForAuthorizedUser.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

const MintTokenForAuthorizedUserComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [to, setTo] = useState(''); // Novo campo de entrada
  const [collectionName, setCollectionName] = useState('');
  const [amount, setAmount] = useState(0);
  const [instanceName, setInstanceName] = useState('');
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

  const mintTokenForAuthorizedUser = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = '0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9';
    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.mintTokenForAuthorizedUser(
        to, // Adicionando o endereço de destino
        collectionName,
        amount,
        instanceName
      );
      await tx.wait();
      setStatus(`Token minted successfully for authorized user: ${tx.hash}`);
    } catch (error) {
      console.error('Error minting token for authorized user:', error);
      setStatus('Error minting token for authorized user');
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
      <h2>Mint Token for Authorized User</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <div>
            <label htmlFor="to">To (Recipient Address):</label>
            <input 
              id="to"
              type="text" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              placeholder="Recipient Address" 
            />
          </div>
          <div>
            <label htmlFor="collectionName">Collection Name:</label>
            <input 
              id="collectionName"
              type="text" 
              value={collectionName} 
              onChange={(e) => setCollectionName(e.target.value)} 
              placeholder="Collection Name" 
            />
          </div>
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
          <div>
            <label htmlFor="instanceName">Instance Name:</label>
            <input 
              id="instanceName"
              type="text" 
              value={instanceName} 
              onChange={(e) => setInstanceName(e.target.value)} 
              placeholder="Instance Name" 
            />
          </div>
          <button onClick={mintTokenForAuthorizedUser}>Mint</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default MintTokenForAuthorizedUserComponent;
