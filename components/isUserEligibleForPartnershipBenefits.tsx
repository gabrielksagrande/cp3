// components/IsUserEligibleForPartnershipBenefits.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css';

const IsUserEligibleForPartnershipBenefitsComponent = () => {
  const [partnershipId, setPartnershipId] = useState(0);
  const [user, setUser] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [error, setError] = useState(''); // Novo estado para armazenar a mensagem de erro
  const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

  useEffect(() => {
    const checkEligibility = async () => {
      if (window.ethereum && user) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, provider);
        try {
          const eligible = await contract.isUserEligibleForPartnershipBenefits(user, partnershipId);
          setIsEligible(eligible);
          setError(''); // Limpa qualquer mensagem de erro anterior
        } catch (err) {
          if (err.reason === "No authorizations found for user") {
            setError('No authorizations found for user');
            setIsEligible(false); // Define elegibilidade como falsa em caso de erro
          } else {
            setError('Error checking eligibility');
            console.error(err);
          }
        }
      }
    };
    checkEligibility();
  }, [partnershipId, user]);

  return (
    <div className={styles.couponContainer}>
      <h2>Check User Eligibility for Partnership Benefits</h2>
      <div className={styles.coupon}>
        <label htmlFor="partnershipId">Partnership ID:</label>
        <input 
          id="partnershipId"
          type="number" 
          value={partnershipId} 
          onChange={(e) => setPartnershipId(Number(e.target.value))} 
          placeholder="Partnership ID" 
        />
        <label htmlFor="user">User Address:</label>
        <input 
          id="user"
          type="text" 
          value={user} 
          onChange={(e) => setUser(e.target.value)} 
          placeholder="User Address" 
        />
        {error ? <p className={styles.error}>{error}</p> : <p>Eligibility: {isEligible ? 'Eligible' : 'Not Eligible'}</p>}
      </div>
    </div>
  );
};

export default IsUserEligibleForPartnershipBenefitsComponent;
