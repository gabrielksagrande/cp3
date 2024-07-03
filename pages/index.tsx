import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CreateCollectionComponent from "../components/CreateCollection";
import GetAllCollectionsComponent from "../components/GetAllCollections";
import MintTokenComponent from "../components/MintToken";
import MintTokenForAuthorizedUserComponent from "../components/MintTokenForAuthorizedUser";
import BurnTokenComponent from "../components/BurnToken";
import ProposePartnershipComponent from "../components/proposePartnership";
import AddPartnerComponent from "../components/addPartner";
import ApprovePartnershipComponent from "../components/approvePartnership";
import AuthorizeBenefitComponent from "../components/authorizeBenefit";
import GetAuthorizationsByBeneficiaryComponent from "../components/getAuthorizationsByBeneficiary";
import IsUserEligibleForPartnershipBenefitsComponent from "../components/isUserEligibleForPartnershipBenefits";
import GetPartnershipByIdComponent from "../components/getPartnershipById";
import ExecuteBuyOrderComponent from "../components/executeBuyOrder";
import ExecuteSellOrderComponent from "../components/executeSellOrder";
import GetAllBuyOrdersComponent from "../components/getAllBuyOrders";
import GetAllSellOrdersComponent from "../components/getAllSellOrders";
import OpenBuyOrderComponent from "../components/openBuyOrder";
import OpenSellOrderComponent from "../components/openSellOrder";
import GetDetailedBalancesComponent from "../components/GetDetailedBalances";

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
            case 'MintTokenForAuthorizedUser':
                return <MintTokenForAuthorizedUserComponent />;
            case 'IsUserEligibleForPartnershipBenefits':
                return <IsUserEligibleForPartnershipBenefitsComponent />;
            case 'GetAllBuyOrders':
                return <GetAllBuyOrdersComponent />;
            case 'GetAllSellOrders':
                return <GetAllSellOrdersComponent />;
            case 'ExecuteBuyOrder':
                return <ExecuteBuyOrderComponent />;
            case 'ExecuteSellOrder':
                return <ExecuteSellOrderComponent />;
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
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="h1">
                There you go... a canvas for your next Celo project!
            </div>
            {isConnected ? (
                <div className="h2 text-center">
                    Your address: {userAddress}
                </div>
            ) : (
                <div>No Wallet Connected</div>
            )}
            <div>
                <h1>Bem-vindo ao Meu DApp na Celo</h1>
                <GetDetailedBalancesComponent /> {/* Always render this component */}
                <div>
                    <button onClick={() => handleMainButtonClick('CreateCupom')}>Create Cupom</button>
                    <button onClick={() => handleMainButtonClick('Marketplace')}>Marketplace</button>
                    <button onClick={() => handleMainButtonClick('UseCupom')}>Use Cupom</button>
                    <button onClick={() => handleMainButtonClick('Partnerships')}>Partnerships</button>
                </div>

                {activeMainButton === 'CreateCupom' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('CreateCollection')}>Criar Nova Coleção</button>
                        <button onClick={() => handleSubButtonClick('MintToken')}>Mintar Token</button>
                        <button onClick={() => handleSubButtonClick('MintTokenForAuthorizedUser')}>Mintar Token para Usuário Autorizado</button>
                        <button onClick={() => handleSubButtonClick('IsUserEligibleForPartnershipBenefits')}>Verificar Elegibilidade de Benefícios</button>
                    </div>
                )}
                {activeMainButton === 'Marketplace' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('GetAllBuyOrders')}>Ver Todos os Pedidos de Compra</button>
                        <button onClick={() => handleSubButtonClick('GetAllSellOrders')}>Ver Todos os Pedidos de Venda</button>
                        <button onClick={() => handleSubButtonClick('ExecuteBuyOrder')}>Executar Pedido de Compra</button>
                        <button onClick={() => handleSubButtonClick('ExecuteSellOrder')}>Executar Pedido de Venda</button>
                        <button onClick={() => handleSubButtonClick('OpenBuyOrder')}>Abrir Pedido de Compra</button>
                        <button onClick={() => handleSubButtonClick('OpenSellOrder')}>Abrir Pedido de Venda</button>
                    </div>
                )}
                {activeMainButton === 'UseCupom' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('BurnToken')}>Queimar Token</button>
                    </div>
                )}
                {activeMainButton === 'Partnerships' && (
                    <div>
                        <button onClick={() => handleSubButtonClick('ProposePartnership')}>Propor Parceria</button>
                        <button onClick={() => handleSubButtonClick('AddPartner')}>Adicionar Parceiro</button>
                        <button onClick={() => handleSubButtonClick('ApprovePartnership')}>Aprovar Parceria</button>
                        <button onClick={() => handleSubButtonClick('AuthorizeBenefit')}>Autorizar Benefício</button>
                        <button onClick={() => handleSubButtonClick('GetAuthorizationsByBeneficiary')}>Ver Autorizações por Beneficiário</button>
                        <button onClick={() => handleSubButtonClick('GetPartnershipById')}>Ver Parceria por ID</button>
                    </div>
                )}

                {renderSubComponents()}
            </div>
        </div>
    );
}
