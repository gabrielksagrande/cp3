// components/BurnToken.tsx
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

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

    const contractAddress = '0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9';
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
    <div>
      <h2>Queimar Token</h2>
      {!isConnected ? (
        <button onClick={() => connect({ connector: connectors[0] })}>Conectar Carteira</button>
      ) : (
        <>
          <input 
            type="text" 
            value={collectionName} 
            onChange={(e) => setCollectionName(e.target.value)} 
            placeholder="Nome da Coleção" 
          />
          <input 
            type="number" 
            value={tokenId} 
            onChange={(e) => setTokenId(Number(e.target.value))} 
            placeholder="ID do Token" 
          />
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            placeholder="Quantidade" 
          />
          <button onClick={burnToken}>Queimar</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default BurnTokenComponent;
