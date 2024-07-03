// components/GetPartnershipById.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses  from './contractAddresses.json'


const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

const GetPartnershipByIdComponent = () => {
  const [partnershipId, setPartnershipId] = useState(0);
  const [partnership, setPartnership] = useState(null);

  useEffect(() => {
    const fetchPartnership = async () => {
      if (window.ethereum && partnershipId >= 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, provider);
        const partnershipData = await contract.getPartnershipById(partnershipId);
        setPartnership(partnershipData);
      }
    };
    fetchPartnership();
  }, [partnershipId]);

  return (
    <div>
      <h2>Get Partnership By ID</h2>
      <input 
        type="number" 
        value={partnershipId} 
        onChange={(e) => setPartnershipId(Number(e.target.value))} 
        placeholder="Partnership ID" 
      />
      {partnership && (
        <div>
          <p>Name: {partnership.name}</p>
          <p>Initiator Collection: {partnership.initiatorCollection}</p>
          <p>Partner Collections: {partnership.partnerCollections.join(', ')}</p>
          <p>Initiator: {partnership.initiator}</p>
          <p>Partners: {partnership.partners.join(', ')}</p>
          <p>Terms: {partnership.terms}</p>
          <p>Duration: {partnership.duration}</p>
          <p>Approved: {partnership.approved ? 'Yes' : 'No'}</p>
          <p>Start Time: {new Date(partnership.startTime * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default GetPartnershipByIdComponent;
