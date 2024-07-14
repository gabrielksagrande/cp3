// components/GetAllCollections.tsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import contractAddresses  from './contractAddresses.json'

const GetAllCollectionsComponent = () => {
  const [collections, setCollections] = useState([]);
  const contractAddress = contractAddresses.contracts.cp1;

  useEffect(() => {
    const fetchCollections = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, cp1Abi, provider);
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
      <h2>All coupons</h2>
      <ul>
        {collections.map((collection, index) => (
          <li key={index}>
            <p>Name: {collection.collectionName}</p>
            <p>Description: {collection.description}</p>
            <p>Image: {collection.image}</p>
            <p>Validity: {collection.validityMinutes} minutes</p>
            <p>Sugested price: {collection.suggestedPrice} cUSD</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetAllCollectionsComponent;
