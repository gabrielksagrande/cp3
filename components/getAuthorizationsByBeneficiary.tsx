// components/GetAuthorizationsByBeneficiary.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o CSS Module

const GetAuthorizationsByBeneficiaryComponent = () => {
  const [partnershipId, setPartnershipId] = useState(0);
  const [beneficiary, setBeneficiary] = useState('');
  const [authorizations, setAuthorizations] = useState([]);
  const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

  useEffect(() => {
    const fetchAuthorizations = async () => {
      if (window.ethereum && beneficiary) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, provider);
        const auths = await contract.getAuthorizationsByBeneficiary(partnershipId, beneficiary);

        // Format the fetched data
        const formattedAuths = auths.map(auth => ({
          partnershipId: auth.partnershipId.toString(),
          authorizer: auth.authorizer,
          beneficiary: auth.beneficiary,
          timestamp: auth.timestamp.toNumber(),
          spending: auth.spending.toString()
        }));

        setAuthorizations(formattedAuths);
      }
    };
    fetchAuthorizations();
  }, [partnershipId, beneficiary]);

  return (
    <div className={styles.couponContainer}>
      <h2>Get Authorizations By Beneficiary</h2>
      <div className={styles.coupon}>
        <label htmlFor="partnershipId">Partnership ID:</label>
        <input 
          id="partnershipId"
          type="number" 
          value={partnershipId} 
          onChange={(e) => setPartnershipId(Number(e.target.value))} 
          placeholder="Partnership ID" 
        />
      
        <label htmlFor="beneficiary">Beneficiary Address:</label>
        <input 
          id="beneficiary"
          type="text" 
          value={beneficiary} 
          onChange={(e) => setBeneficiary(e.target.value)} 
          placeholder="Beneficiary Address" 
        />
      </div>
      {authorizations.length > 0 && (
        <div>
          {authorizations.map((auth, index) => (
            <div key={index} className={styles.coupon}>
              <p>Partnership ID: {auth.partnershipId}</p>
              <p>Authorizer: {auth.authorizer}</p>
              <p>Beneficiary: {auth.beneficiary}</p>
              <p>Timestamp: {new Date(auth.timestamp * 1000).toLocaleString()}</p>
              <p>Spending: {auth.spending}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetAuthorizationsByBeneficiaryComponent;
