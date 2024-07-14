// components/FetchBurnedTokensForUser.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAbi from './cp1Abi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const FetchBurnedTokensForUserComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [user, setUser] = useState('');
  const [burnedTokens, setBurnedTokens] = useState([]);
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

  const fetchBurnedTokensForUser = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = contractAddresses.contracts.cp1;
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    try {
      const tokens = await contract.fetchBurnedTokensForUser(user);
      const formattedTokens = tokens.map(token => ({
        tokenId: token.tokenId.toString(),
        amount: token.amount.toString(),
        blockTimestamp: token.blockTimestamp.toNumber()
      }));
      setBurnedTokens(formattedTokens);
      setStatus('Burned tokens fetched successfully.');
    } catch (error) {
      console.error('Error fetching burned tokens:', error);
      setStatus('Error fetching burned tokens');
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
      <h2>Fetch Burned Tokens for User</h2>
      {!isConnected ? (
        <button onClick={connectWallet} className={styles.coupon}>Connect Wallet</button>
      ) : (
        <div className={styles.coupon}>
          <div>
            <label htmlFor="user">User Address:</label>
            <input
              id="user"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="User Address"
            />
          </div>
          <button onClick={fetchBurnedTokensForUser}>Fetch Burned Tokens</button>
          <p>Status: {status}</p>
          {burnedTokens.length > 0 && (
            <ul>
              {burnedTokens.map((token, index) => (
                <li key={index}>
                  Token ID: {token.tokenId}, Amount: {token.amount}, Timestamp: {new Date(token.blockTimestamp * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchBurnedTokensForUserComponent;