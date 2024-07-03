// components/AddPartner.tsx
import React, { useState } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses  from './contractAddresses.json'

const contractAddress = contractAddresses.contracts.creatorPartnershipManager;
const AddPartnerComponent = () => {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [partnershipId, setPartnershipId] = useState(0);
  const [partnerCollection, setPartnerCollection] = useState('');
  const [status, setStatus] = useState('');

  const addPartner = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, signer);

    try {
      const tx = await contract.addPartner(partnershipId, partnerCollection);
      await tx.wait();
      setStatus(`Partner added successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error adding partner:', error);
      setStatus('Error adding partner');
    }
  };

  return (
    <div>
      <h2>Add Partner</h2>
      {!isConnected ? (
        <button onClick={() => connect(connectors[0])}>Connect Wallet</button>
      ) : (
        <>
          <input 
            type="number" 
            value={partnershipId} 
            onChange={(e) => setPartnershipId(Number(e.target.value))} 
            placeholder="Partnership ID" 
          />
          <input 
            type="text" 
            value={partnerCollection} 
            onChange={(e) => setPartnerCollection(e.target.value)} 
            placeholder="Partner Collection" 
          />
          <button onClick={addPartner}>Add Partner</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default AddPartnerComponent;
