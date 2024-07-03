// components/GetAllCollections.tsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';

const GetAllCollectionsComponent = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract('0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9', cp1Abi, provider);
        const allCollections = await contract.getAllCollections();
        
        // Convert BigNumber values to strings
        const formattedCollections = allCollections.map(collection => ({
          ...collection,
          validityMinutes: collection.validityMinutes.toNumber(),
          suggestedPrice: ethers.utils.formatUnits(collection.suggestedPrice, 'ether')
        }));

        setCollections(formattedCollections);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div>
      <h2>Todas as Coleções</h2>
      <ul>
        {collections.map((collection, index) => (
          <li key={index}>
            <p>Nome: {collection.collectionName}</p>
            <p>Descrição: {collection.description}</p>
            <p>Imagem: {collection.image}</p>
            <p>Validade: {collection.validityMinutes} minutos</p>
            <p>Preço Sugerido: {collection.suggestedPrice} cUSD</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetAllCollectionsComponent;
