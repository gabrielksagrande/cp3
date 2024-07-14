// components/GetPartnershipById.tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses from './contractAddresses.json';
import styles from './styles.module.css'; // Importando o arquivo CSS Module

const GetPartnershipByIdComponent = () => {
  const [partnershipId, setPartnershipId] = useState(0);
  const [partnership, setPartnership] = useState(null);
  const [status, setStatus] = useState('');
  const contractAddress = contractAddresses.contracts.creatorPartnershipManager;

  const fetchPartnership = async () => {
    if (window.ethereum && partnershipId >= 0) {
      setStatus('Fetching partnership data...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, provider);
      try {
        const partnershipData = await contract.getPartnershipById(partnershipId);

        // Convert BigNumber fields to strings
        const formattedPartnership = {
          ...partnershipData,
          duration: partnershipData.duration.toString(),
          startTime: partnershipData.startTime.toString(),
        };

        setPartnership(formattedPartnership);
        setStatus('Partnership data fetched successfully.');
      } catch (error) {
        console.error('Error fetching partnership:', error);
        setStatus('Error fetching partnership');
      }
    } else {
      setStatus('Please enter a valid partnership ID.');
    }
  };

  return (
    <div className={styles.couponContainer}>
      <h2>Get Partnership By ID</h2>
      <div className={styles.coupon}>
      <label htmlFor="number">Partnership ID:</label>

        <input 
          type="number" 
          value={partnershipId} 
          onChange={(e) => setPartnershipId(Number(e.target.value))} 
          placeholder="Partnership ID" 
        />
        <button onClick={fetchPartnership}>Fetch Partnership</button>
      </div>
      {status && <p>{status}</p>}
      {partnership && (
        <div className={styles.coupon}>
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
