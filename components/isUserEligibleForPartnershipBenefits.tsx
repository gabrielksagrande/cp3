// components/IsUserEligibleForPartnershipBenefits.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses  from './contractAddresses.json'


const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

const IsUserEligibleForPartnershipBenefitsComponent = () => {
  const [partnershipId, setPartnershipId] = useState(0);
  const [user, setUser] = useState('');
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const checkEligibility = async () => {
      if (window.ethereum && user) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, provider);
        const eligible = await contract.isUserEligibleForPartnershipBenefits(user, partnershipId);
        setIsEligible(eligible);
      }
    };
    checkEligibility();
  }, [partnershipId, user]);

  return (
    <div>
      <h2>Check User Eligibility for Partnership Benefits</h2>
      <input 
        type="number" 
        value={partnershipId} 
        onChange={(e) => setPartnershipId(Number(e.target.value))} 
        placeholder="Partnership ID" 
      />
      <input 
        type="text" 
        value={user} 
        onChange={(e) => setUser(e.target.value)} 
        placeholder="User Address" 
      />
      <p>Eligibility: {isEligible ? 'Eligible' : 'Not Eligible'}</p>
    </div>
  );
};

export default IsUserEligibleForPartnershipBenefitsComponent;
