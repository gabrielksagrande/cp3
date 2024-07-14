// components/FetchAllMintedTokensForPartnership.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAbi from './cp1Abi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const FetchAllMintedTokensForPartnershipComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [partnershipId, setPartnershipId] = useState(0);
  const [mintedTokens, setMintedTokens] = useState([]);
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

  const fetchAllMintedTokensForPartnership = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = contractAddresses.contracts.cp1;
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    try {
      const tokens = await contract.fetchAllMintedTokensForPartnership(partnershipId);
      const formattedTokens = tokens.map(token => ({
        to: token.to,
        amount: token.amount.toString(),
        timestamp: token.timestamp.toNumber()
      }));
      setMintedTokens(formattedTokens);
      setStatus('Minted tokens fetched successfully.');
    } catch (error) {
      console.error('Error fetching minted tokens:', error);
      setStatus('Error fetching minted tokens');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      setSigner(signer);
      setIsConnected(true);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div className={styles.couponContainer}>
      <h2>Fetch All Minted Tokens for Partnership</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.coupon}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
          <div>
            <label htmlFor="partnershipId">Partnership ID:</label>
            <input
              id="partnershipId"
              type="number"
              value={partnershipId}
              onChange={(e) => setPartnershipId(Number(e.target.value))}
              placeholder="Partnership ID"
            />
          </div>
          <button onClick={fetchAllMintedTokensForPartnership}>Fetch Minted Tokens</button>
          <p>Status: {status}</p>
          {mintedTokens.length > 0 && (
            <ul>
              {mintedTokens.map((token, index) => (
                <li key={index}>
                  To: {token.to}, Amount: {token.amount}, Timestamp: {new Date(token.timestamp * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchAllMintedTokensForPartnershipComponent;
