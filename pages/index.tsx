// pages/index.tsx
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CreateCollectionComponent from "../components/CreateCollection";
import GetAllCollectionsComponent from "../components/GetAllCollections";
import MintTokenComponent from "../components/MintToken";
import BurnTokenComponent from "../components/BurnToken";
import ProposePartnershipComponent from "../components/proposePartnership";
import AddPartnerComponent from "../components/addPartner";
import ApprovePartnershipComponent from "../components/approvePartnership";
import AuthorizeBenefitComponent from "../components/authorizeBenefit";
import GetAuthorizationsByBeneficiaryComponent from "../components/getAuthorizationsByBeneficiary";
import IsUserEligibleForPartnershipBenefitsComponent from "../components/isUserEligibleForPartnershipBenefits";
import GetPartnershipByIdComponent from "../components/getPartnershipById";
import GetAllBuyOrdersComponent from "../components/getAllBuyOrders";
import GetAllSellOrdersComponent from "../components/getAllSellOrders";
import OpenBuyOrderComponent from "../components/openBuyOrder";
import OpenSellOrderComponent from "../components/openSellOrder";
import GetDetailedBalancesComponent from "../components/GetDetailedBalances";
import MintTokenForPartnershipComponent from "../components/mintTokenForPartnership";
import ApproveCUSDComponent from "../components/ApproveCUSD";
import FetchAllMintedTokensForPartnershipComponent from "../components/FetchAllMintedTokensForPartnership";
import FetchBurnedTokensForCollectionComponent from "../components/FetchBurnedTokensForCollection";
import FetchBurnedTokensForUserComponent from "../components/FetchBurnedTokensForUser";
import styles from "../components/styles.module.css";

export default function Home() {
    const [userAddress, setUserAddress] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const [activeMainButton, setActiveMainButton] = useState("");
    const [activeSubComponent, setActiveSubComponent] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            setUserAddress(address);
        }
    }, [address, isConnected]);

    if (!isMounted) {
        return null;
    }

    const handleMainButtonClick = (buttonName) => {
        if (activeMainButton === buttonName) {
            setActiveMainButton("");
            setActiveSubComponent("");
        } else {
            setActiveMainButton(buttonName);
            setActiveSubComponent("");
        }
    };

    const handleSubButtonClick = (componentName) => {
        if (activeSubComponent === componentName) {
            setActiveSubComponent("");
        } else {
            setActiveSubComponent(componentName);
        }
    };

    const renderSubComponents = () => {
        switch (activeSubComponent) {
            case 'CreateCollection':
                return <CreateCollectionComponent />;
            case 'MintToken':
                return <MintTokenComponent />;
            case 'MintTokenForPartnershipComponent':
                return <MintTokenForPartnershipComponent />;
            case 'IsUserEligibleForPartnershipBenefits':
                return <IsUserEligibleForPartnershipBenefitsComponent />;
            case 'GetAllBuyOrders':
                return <GetAllBuyOrdersComponent />;
            case 'GetAllSellOrders':
                return <GetAllSellOrdersComponent />;
            case 'OpenBuyOrder':
                return <OpenBuyOrderComponent />;
            case 'OpenSellOrder':
                return <OpenSellOrderComponent />;
            case 'BurnToken':
                return <BurnTokenComponent />;
            case 'ProposePartnership':
                return <ProposePartnershipComponent />;
            case 'AddPartner':
                return <AddPartnerComponent />;
            case 'ApprovePartnership':
                return <ApprovePartnershipComponent />;
            case 'AuthorizeBenefit':
                return <AuthorizeBenefitComponent />;
            case 'GetAuthorizationsByBeneficiary':
                return <GetAuthorizationsByBeneficiaryComponent />;
            case 'GetPartnershipById':
                return <GetPartnershipByIdComponent />;
            case 'ApproveCUSD':
                return <ApproveCUSDComponent />;
            case 'FetchBurnedTokensForUser':
                return <FetchBurnedTokensForUserComponent />;
            case 'FetchBurnedTokensForCollection':
                return <FetchBurnedTokensForCollectionComponent />;
            case 'FetchAllMintedTokensForPartnership':
                return <FetchAllMintedTokensForPartnershipComponent />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className={styles.title}>
                COUPON3
            </div>
            {isConnected ? (
                <div className="h2 text-center">
                    Your address: {userAddress}
                </div>
            ) : (
                <div>No Wallet Connected</div>
            )}
            <div>
                <GetDetailedBalancesComponent />
                <div>
                    <button onClick={() => handleMainButtonClick('CreateCupom')}>Create Cupons</button>
                    <button onClick={() => handleMainButtonClick('Marketplace')}>Marketplace</button>
                    <button onClick={() => handleMainButtonClick('UseCupom')}>Use Cupons</button>
                    <button onClick={() => handleMainButtonClick('Partnerships')}>Partnerships</button>
                </div>

                {activeMainButton === 'CreateCupom' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('CreateCollection')}>Create COUPON</button>
                        <button onClick={() => handleSubButtonClick('MintToken')}>Mint COUPON</button>
                        <button onClick={() => handleSubButtonClick('MintTokenForPartnershipComponent')}>Mint coupon for partnership</button>
                        <button onClick={() => handleSubButtonClick('IsUserEligibleForPartnershipBenefits')}>Check elegibility</button>
                    </div>
                )}
                {activeMainButton === 'Marketplace' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('GetAllBuyOrders')}>Get all buy orders</button>
                        <button onClick={() => handleSubButtonClick('GetAllSellOrders')}>Get all sell orders</button>
                        <button onClick={() => handleSubButtonClick('OpenBuyOrder')}>Open buy order</button>
                        <button onClick={() => handleSubButtonClick('OpenSellOrder')}>Open sell Order </button>
                    </div>
                )}
                {activeMainButton === 'UseCupom' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('BurnToken')}>Burn coupon</button>
                        <button onClick={() => handleSubButtonClick('FetchBurnedTokensForUser')}>Fetch burned Tokens for user</button>
                        <button onClick={() => handleSubButtonClick('FetchBurnedTokensForCollection')}>Fetch burned tokens for collection</button>
                        <button onClick={() => handleSubButtonClick('FetchAllMintedTokensForPartnership')}>Fetch all minted tokens for partnership</button>
                    </div>
                )}
                {activeMainButton === 'Partnerships' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('ProposePartnership')}>Propose Partnership</button>
                        <button onClick={() => handleSubButtonClick('AddPartner')}>Add Partner</button>
                        <button onClick={() => handleSubButtonClick('ApprovePartnership')}>Aprove Partnership</button>
                        <button onClick={() => handleSubButtonClick('AuthorizeBenefit')}>Autorize Benefit</button>
                        <button onClick={() => handleSubButtonClick('GetAuthorizationsByBeneficiary')}>Check authorizations by beneficiary</button>
                        <button onClick={() => handleSubButtonClick('GetPartnershipById')}>Check partnership by ID</button>
                    </div>
                )}

                {renderSubComponents()}
            </div>
        </div>
    );
}
