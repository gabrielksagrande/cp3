// components/BurnToken.tsx
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import contractAddressess from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const BurnTokenComponent = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const getSigner = async () => {
      if (window.ethereum && address) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSigner(provider.getSigner());
      }
    };
    getSigner();
  }, [address]);

  const [collectionName, setCollectionName] = useState('');
  const [tokenId, setTokenId] = useState(0);
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState('');

  const burnToken = async () => {
    if (!signer) {
      setStatus('Por favor, conecte sua carteira.');
      return;
    }

    const contractAddress = contractAddressess.contracts.cp1;
    const contract = new ethers.Contract(contractAddress, cp1Abi, signer);

    try {
      const tx = await contract.burn(collectionName, tokenId, amount);
      await tx.wait();
      setStatus(`Token queimado com sucesso: ${tx.hash}`);
    } catch (error) {
      console.error('Erro ao queimar token:', error);
      setStatus('Erro ao queimar token');
    }
  };

  return (
    <div className={styles.couponContainer}>
      <h2>Queimar Token</h2>
      {!isConnected ? (
        <button onClick={() => connect({ connector: connectors[0] })} className={styles.coupon}>Conectar Carteira</button>
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
            <label htmlFor="tokenId">Token ID :</label>
            <input 
              id="tokenId"
              type="number" 
              value={tokenId} 
              onChange={(e) => setTokenId(Number(e.target.value))} 
              placeholder="Token ID" 
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
          <button onClick={burnToken}>Burn</button>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default BurnTokenComponent;