// components/ApprovePartnership.tsx
import React, { useState } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses  from './contractAddresses.json'

const ApprovePartnershipComponent = () => {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [partnershipId, setPartnershipId] = useState(0);
  const [status, setStatus] = useState('');

  const approvePartnership = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = contractAddresses.contracts.creatorPartnershipManager;
    const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, signer);

    try {
      const tx = await contract.approvePartnership(partnershipId);
      await tx.wait();
      setStatus(`Partnership approved successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error approving partnership:', error);
      setStatus('Error approving partnership');
    }
  };

  return (
    <div>
      <h2>Approve Partnership</h2>
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
          <button onClick={approvePartnership}>Approve</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default ApprovePartnershipComponent;
