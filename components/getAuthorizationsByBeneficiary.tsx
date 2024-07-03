// components/GetAuthorizationsByBeneficiary.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses  from './contractAddresses.json'


const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

const GetAuthorizationsByBeneficiaryComponent = () => {
  const [partnershipId, setPartnershipId] = useState(0);
  const [beneficiary, setBeneficiary] = useState('');
  const [authorizations, setAuthorizations] = useState([]);

  useEffect(() => {
    const fetchAuthorizations = async () => {
      if (window.ethereum && beneficiary) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, provider);
        const auths = await contract.getAuthorizationsByBeneficiary(partnershipId, beneficiary);
        setAuthorizations(auths);
      }
    };
    fetchAuthorizations();
  }, [partnershipId, beneficiary]);

  return (
    <div>
      <h2>Get Authorizations By Beneficiary</h2>
      <input 
        type="number" 
        value={partnershipId} 
        onChange={(e) => setPartnershipId(Number(e.target.value))} 
        placeholder="Partnership ID" 
      />
      <input 
        type="text" 
        value={beneficiary} 
        onChange={(e) => setBeneficiary(e.target.value)} 
        placeholder="Beneficiary Address" 
      />
      <ul>
        {authorizations.map((auth, index) => (
          <li key={index}>
            <p>Partnership ID: {auth.partnershipId}</p>
            <p>Authorizer: {auth.authorizer}</p>
            <p>Beneficiary: {auth.beneficiary}</p>
            <p>Timestamp: {new Date(auth.timestamp * 1000).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetAuthorizationsByBeneficiaryComponent;
