// components/CreateCollection.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

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

    const contractAddress = '0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9';
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
    <div>
      <h2>Criar Coleção</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Conectar Carteira</button>
      ) : (
        <>
          <div>
            <label htmlFor="collectionName">Nome da Coleção:</label>
            <input 
              id="collectionName"
              type="text" 
              value={collectionName} 
              onChange={(e) => setCollectionName(e.target.value)} 
              placeholder="Nome da Coleção" 
            />
          </div>
          <div>
            <label htmlFor="description">Descrição:</label>
            <input 
              id="description"
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Descrição" 
            />
          </div>
          <div>
            <label htmlFor="image">URL da Imagem:</label>
            <input 
              id="image"
              type="text" 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
              placeholder="URL da Imagem" 
            />
          </div>
          <div>
            <label htmlFor="validityMinutes">Validade em Minutos:</label>
            <input 
              id="validityMinutes"
              type="number" 
              value={validityMinutes} 
              onChange={(e) => setValidityMinutes(Number(e.target.value))} 
              placeholder="Validade em Minutos" 
            />
          </div>
          <div>
            <label htmlFor="suggestedPrice">Preço Sugerido:</label>
            <input 
              id="suggestedPrice"
              type="number" 
              value={suggestedPrice} 
              onChange={(e) => setSuggestedPrice(Number(e.target.value))} 
              placeholder="Preço Sugerido" 
            />
          </div>
          <button onClick={createCollection}>Criar</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default CreateCollectionComponent;
