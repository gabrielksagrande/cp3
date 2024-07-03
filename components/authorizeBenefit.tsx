// components/AuthorizeBenefit.tsx
import React, { useState } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import creatorPartnershipManagerAbi from './creatorPartnershipManagerAbi.json';
import contractAddresses  from './contractAddresses.json'

const AuthorizeBenefitComponent = () => {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [partnershipId, setPartnershipId] = useState(0);
  const [beneficiary, setBeneficiary] = useState('');
  const [status, setStatus] = useState('');

  const authorizeBenefit = async () => {
    if (!signer) {
      setStatus('Please connect your wallet.');
      return;
    }

    const contractAddress = contractAddresses.contracts.creatorPartnershipManager;
    const contract = new ethers.Contract(contractAddress, creatorPartnershipManagerAbi, signer);

    try {
      const tx = await contract.authorizeBenefit(partnershipId, beneficiary);
      await tx.wait();
      setStatus(`Benefit authorized successfully: ${tx.hash}`);
    } catch (error) {
      console.error('Error authorizing benefit:', error);
      setStatus('Error authorizing benefit');
    }
  };

  return (
    <div>
      <h2>Authorize Benefit</h2>
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
            value={beneficiary} 
            onChange={(e) => setBeneficiary(e.target.value)} 
            placeholder="Beneficiary Address" 
          />
          <button onClick={authorizeBenefit}>Authorize</button>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
};

export default AuthorizeBenefitComponent;
