// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";    
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

interface ICollection {
    struct MintedTknInfo {
        address to;
        uint256 amount;
        uint256 timestamp;
    }

    function getCollectionCreator(string memory collectionName) external view returns (address);
     
    function fetchMintedTokensForPartnershipByUser(uint256 partnershipId, address user) external view returns (MintedTknInfo[] memory);
}

interface ICreatorPartnershipManager {
    function isUserEligibleForPartnershipBenefits(address user, uint256 partnershipId) external view returns (bool);
}

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract coupom3 is ERC1155, Ownable, IERC1155Receiver {
    using SafeERC20 for IERC20Token;
    IERC20Token public cUSD = IERC20Token(0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1); // Address for cUSD

    struct CollectionData {
        address creator;
        string collectionName;
        string description;
        string image;
        uint256 validityMinutes;
        uint256 suggestedPrice;
        uint256 mintedCount;
    }
    
    struct TokenInfo {
        uint256 collectionId;
        uint256 tokenId;
        uint256 amount;
        uint256 validityTime;
    }

    struct BurnInfo {
        uint256 tokenId;
        uint256 amount;
        uint256 blockTimestamp;
    }

    struct MintedTknInfo {
        address to;
        uint256 amount;
        uint256 timestamp;
    }

    struct SellOrder {
        address seller;
        string collectionName;
        uint256 tokenId;
        uint256 amount;
        uint256 price;
        string status;
        uint256 originalValidityTime;
        uint256 sellOrderCounter;
        address authorizerAddress;
        bool contractToken;
    }   

    struct BuyOrder {
        address buyer;
        string collectionName;
        uint256 amount;
        uint256 price;
        string status;
        uint256 buyOrderCounter;
    }

    mapping(uint256 => BuyOrder) public buyOrders;
    mapping(uint256 => SellOrder) public sellOrders;

    uint256 public buyOrderCounter;
    uint256 public sellOrderCounter;
    mapping(uint256 => CollectionData) private _collections;
    mapping(string => uint256) private _collectionNameToId;
    mapping(uint256 => mapping(uint256 => uint256)) private _mintedTimestamps;
    mapping(uint256 => uint256) private _tokenIdToCollectionId;
    mapping(address => TokenInfo[]) public accountToTokens;
    mapping(uint256 => TokenInfo) public tokenIdToTokenInfo;
    mapping(uint256 => string) public tokenIdToInstanceName;
    mapping(uint256 => address) public tokenIdToAuthorizerAddress;
    mapping(uint256 => mapping(string => uint256)) private collectionIdToInstanceToMintCount;
    mapping(string => mapping(string => mapping(address => uint256))) public instanceCollectionUserAmounts;
    mapping(address => BurnInfo[]) public burns;
    mapping(uint256 => mapping(address => MintedTknInfo[])) public mintedTokensForPartnershipByUser;
    mapping(uint256 => MintedTknInfo[]) public mintedTokensForPartnership; // Mapeamento para armazenar todos os tokens mintados por parceria
    mapping(uint256 => BurnInfo[]) public burnedTokensForCollection; // Mapeamento para armazenar todos os tokens queimados por coleção
    mapping(address => BurnInfo[]) public burnedTokensForUser; // Mapeamento para armazenar todos os tokens queimados por usuário

    uint256 private _collectionIdCounter;
    uint256 private _currentTokenId = 0;
    address public currentAuthorizerAddress;
    uint256 public lastMilestone = 0;
    address public tempAuthorizerAddress;
    ICreatorPartnershipManager public partnershipManager;

    constructor() ERC1155("") Ownable(msg.sender) {
    }

    event ERC20Received(address indexed from, uint256 amount);

    function onERC20Received(address /*from*/, uint256 /*amount*/) external pure returns (bytes4) {
        return this.onERC20Received.selector;
    }

    function setPartnershipManagerAddress(address _partnershipManagerAddress) external onlyOwner {
        partnershipManager = ICreatorPartnershipManager(_partnershipManagerAddress);
    }

    function createCollection(string memory collectionName, string memory description, string memory image, uint256 validityMinutes, uint256 suggestedPrice) external {
        CollectionData storage newCollection = _collections[_collectionIdCounter];
        newCollection.creator = msg.sender;
        newCollection.collectionName = collectionName;
        newCollection.description = description;
        newCollection.image = image;
        newCollection.validityMinutes = validityMinutes;
        newCollection.suggestedPrice = suggestedPrice * 1e18;
        newCollection.mintedCount = 0;

        _collectionNameToId[collectionName] = _collectionIdCounter;
        _collectionIdCounter++;
    }

    function getAllCollections() public view returns (CollectionData[] memory) {
        CollectionData[] memory allCollections = new CollectionData[](_collectionIdCounter);
        for (uint256 i = 0; i < _collectionIdCounter; i++) {
            CollectionData storage collection = _collections[i];
            allCollections[i] = collection;
        }
        return allCollections;
    }

    function getCollectionCreator(string memory collectionName) public view returns (address) {
        uint256 collectionId = _collectionNameToId[collectionName];
        require(collectionId < _collectionIdCounter, "Invalid collection name");
        return _collections[collectionId].creator;
    }

    function mintToken(address to, string memory collectionName, uint256 amount) public {
        uint256 collectionId = _collectionNameToId[collectionName];
        require(collectionId < _collectionIdCounter, "Invalid collection name");

        CollectionData storage collection = _collections[collectionId];
        require(msg.sender == collection.creator, "Only the collection creator can mint tokens");

        _mint(to, _currentTokenId, amount, "");
        _mintedTimestamps[collectionId][_currentTokenId] = block.timestamp;
        _tokenIdToCollectionId[_currentTokenId] = collectionId;

        TokenInfo memory newTokenInfo = TokenInfo({
            collectionId: collectionId,
            tokenId: _currentTokenId,
            amount: amount,
            validityTime: block.timestamp + collection.validityMinutes * 1 minutes
        });

        tokenIdToTokenInfo[_currentTokenId] = newTokenInfo;
        accountToTokens[to].push(newTokenInfo);
        _currentTokenId++;

        uint256 newMintedCount = collection.mintedCount + amount;
        uint256 previousMintedCount = collection.mintedCount;

        collection.mintedCount = newMintedCount;

        uint256 multiplesOf100 = newMintedCount / 100;
        uint256 previousMultiplesOf100 = previousMintedCount / 100;

        for (uint256 i = previousMultiplesOf100 + 1; i <= multiplesOf100; i++) {
            _mint(address(this), _currentTokenId, 1, "");

            TokenInfo memory extraTokenInfo = TokenInfo({
                collectionId: collectionId,
                tokenId: _currentTokenId,
                amount: 1,
                validityTime: block.timestamp + collection.validityMinutes * 1 minutes
            });

            tokenIdToTokenInfo[_currentTokenId] = extraTokenInfo;
            uint256 sellPrice = (collection.suggestedPrice * 90) / 100;
            bool contractToken = true;
            openContractSellOrder(collectionName, _currentTokenId, sellPrice, 1, contractToken);

            _currentTokenId++;
        }
    }

    function mintTokenForPartnership(
        address to,
        string memory collectionName,
        uint256 amount,
        uint256 partnershipId
    ) external {
        uint256 collectionId = _collectionNameToId[collectionName];
        CollectionData storage collection = _collections[collectionId];
        require(partnershipManager.isUserEligibleForPartnershipBenefits(to, partnershipId), "User not eligible for partnership benefits");

        _mint(to, _currentTokenId, amount, "");
        _mintedTimestamps[collectionId][_currentTokenId] = block.timestamp;
        _tokenIdToCollectionId[_currentTokenId] = collectionId;
        tokenIdToAuthorizerAddress[_currentTokenId] = msg.sender;

        TokenInfo memory newTokenInfo = TokenInfo({
            collectionId: collectionId,
            tokenId: _currentTokenId,
            amount: amount,
            validityTime: block.timestamp + collection.validityMinutes * 1 minutes
        });

        tokenIdToTokenInfo[_currentTokenId] = newTokenInfo;
        accountToTokens[to].push(newTokenInfo);
        _currentTokenId++;

        uint256 newMintedCount = collection.mintedCount + amount;
        uint256 previousMintedCount = collection.mintedCount;

        collection.mintedCount = newMintedCount;

        uint256 multiplesOf100 = newMintedCount / 100;
        uint256 previousMultiplesOf100 = previousMintedCount / 100;

        for (uint256 i = previousMultiplesOf100 + 1; i <= multiplesOf100; i++) {
            _mint(address(this), _currentTokenId, 1, "");

            TokenInfo memory extraTokenInfo = TokenInfo({
                collectionId: collectionId,
                tokenId: _currentTokenId,
                amount: 1,
                validityTime: block.timestamp + collection.validityMinutes * 1 minutes
            });

            tokenIdToTokenInfo[_currentTokenId] = extraTokenInfo;
            uint256 sellPrice = (collection.suggestedPrice * 90) / 100;
            bool contractToken = true;
            openContractSellOrder(collectionName, _currentTokenId, sellPrice, 1, contractToken);

            _currentTokenId++;
        }

        MintedTknInfo memory mintedInfo = MintedTknInfo({
            to: to,
            amount: amount,
            timestamp: block.timestamp
        });

        mintedTokensForPartnershipByUser[partnershipId][to].push(mintedInfo);
        mintedTokensForPartnership[partnershipId].push(mintedInfo); // Registro de todos os tokens mintados por parceria
    }

    function fetchMintedTokensForPartnershipByUser(uint256 partnershipId, address user) external view returns (MintedTknInfo[] memory) {
        return mintedTokensForPartnershipByUser[partnershipId][user];
    }

    function fetchAllMintedTokensForPartnership(uint256 partnershipId) external view returns (MintedTknInfo[] memory) {
        return mintedTokensForPartnership[partnershipId];
    }

    function openContractSellOrder(string memory collectionName, uint256 tokenId, uint256 _price, uint256 _amount, bool contractToken) internal {
        uint256 originalValidityTime = _mintedTimestamps[_tokenIdToCollectionId[tokenId]][tokenId] + _collections[_tokenIdToCollectionId[tokenId]].validityMinutes * 1 minutes;
        address authorizerAddress = tokenIdToAuthorizerAddress[tokenId];
        
        sellOrders[sellOrderCounter] = SellOrder(
            address(this),
            collectionName,
            tokenId,
            _amount,
            _price,
            "OPEN",
            originalValidityTime,
            sellOrderCounter,
            authorizerAddress,
            contractToken
        );

        sellOrderCounter++;
    }

    function getDetailedBalances(address account) public view returns (TokenInfo[] memory, uint256[] memory, string[] memory, string[] memory, string[] memory, uint256[] memory) {
        TokenInfo[] memory accountTokens = accountToTokens[account];
        
        if (accountTokens.length == 0) {
            uint256[] memory emptyTimeLeftToExpire = new uint256[](0);
            string[] memory emptyCollectionNames = new string[](0);
            string[] memory emptyCollectionImages = new string[](0);
            string[] memory emptyDescriptions = new string[](0);
            uint256[] memory emptySuggestedPrices = new uint256[](0);
            return (accountTokens, emptyTimeLeftToExpire, emptyCollectionNames, emptyCollectionImages, emptyDescriptions, emptySuggestedPrices);
        }

        uint256[] memory timeLeftToExpire = new uint256[](accountTokens.length);
        string[] memory collectionNames = new string[](accountTokens.length);
        string[] memory collectionImages = new string[](accountTokens.length);
        string[] memory descriptions = new string[](accountTokens.length);
        uint256[] memory suggestedPrices = new uint256[](accountTokens.length);

        for (uint256 i = 0; i < accountTokens.length; i++) {
            if (accountTokens[i].validityTime > block.timestamp) {
                uint256 timeLeft = accountTokens[i].validityTime - block.timestamp;
                timeLeftToExpire[i] = (timeLeft >= 60) ? timeLeft / 60 : 1;
            } else {
                timeLeftToExpire[i] = 0;
            }

            collectionNames[i] = _collections[accountTokens[i].collectionId].collectionName;
            collectionImages[i] = _collections[accountTokens[i].collectionId].image;
            descriptions[i] = _collections[accountTokens[i].collectionId].description;
            suggestedPrices[i] = _collections[accountTokens[i].collectionId].suggestedPrice;
        }

        return (accountTokens, timeLeftToExpire, collectionNames, collectionImages, descriptions, suggestedPrices);
    }

    function checkTokenValidity(uint256 tokenId) internal view {
        TokenInfo memory tokenInfo = tokenIdToTokenInfo[tokenId];
        require(block.timestamp <= tokenInfo.validityTime, "Token has expired!");
    }

    function burn(string memory collectionName, uint256 tokenId, uint256 amount) public {
        uint256 collectionId = _collectionNameToId[collectionName];
        require(collectionId < _collectionIdCounter, "Invalid collection name");

        checkTokenValidity(tokenId);
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient token balance");

        for (uint i = 0; i < accountToTokens[msg.sender].length; i++) {
            if (accountToTokens[msg.sender][i].tokenId == tokenId && accountToTokens[msg.sender][i].collectionId == collectionId) {
                require(accountToTokens[msg.sender][i].amount >= amount, "Insufficient token balance in TokenInfo");
                accountToTokens[msg.sender][i].amount -= amount;
                break;
            }
        }

        _burn(msg.sender, tokenId, amount);
        BurnInfo memory burnInfo = BurnInfo({
            tokenId: tokenId,
            amount: amount,
            blockTimestamp: block.timestamp
        });
        burns[msg.sender].push(burnInfo);
        burnedTokensForCollection[collectionId].push(burnInfo); // Registro de tokens queimados por coleção
        burnedTokensForUser[msg.sender].push(burnInfo); // Registro de tokens queimados por usuário
    }

    function fetchBurnedTokensForCollection(uint256 collectionId) external view returns (BurnInfo[] memory) {
        return burnedTokensForCollection[collectionId];
    }

    function fetchBurnedTokensForUser(address user) external view returns (BurnInfo[] memory) {
        return burnedTokensForUser[user];
    }

    function transferFromEscrow(string memory collectionName, uint256 tokenId, uint256 _amount) internal {
        checkTokenValidity(tokenId);
        _safeTransferFrom(address(this), msg.sender, tokenId, _amount, "");
    }

    function transferToEscrow(string memory collectionName, uint256 tokenId, uint256 amount) internal {
        checkTokenValidity(tokenId);
        _safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
    }

    function openSellOrder(string memory collectionName, uint256 tokenId, uint256 _price, uint256 _amount) public {
        require(_collectionNameToId[collectionName] < _collectionIdCounter, "Invalid collection name");
        transferToEscrow(collectionName, tokenId, _amount);

        TokenInfo[] storage sellerTokens = accountToTokens[msg.sender];
        for (uint i = 0; i < sellerTokens.length; i++) {
            if (sellerTokens[i].tokenId == tokenId) {
                require(sellerTokens[i].amount >= _amount, "Insufficient tokens to sell");
                sellerTokens[i].amount -= _amount;
                break;
            }
        }

        uint256 originalValidityTime = _mintedTimestamps[_tokenIdToCollectionId[tokenId]][tokenId] + _collections[_tokenIdToCollectionId[tokenId]].validityMinutes * 1 minutes;
        uint256 priceInSmallestUnit = _price;
        sellOrders[sellOrderCounter] = SellOrder(msg.sender, collectionName, tokenId, _amount, priceInSmallestUnit, "OPEN", originalValidityTime, sellOrderCounter, address(0), false);
        sellOrderCounter++;
    }

    function openBuyOrder(string memory collectionName, uint256 _price, uint256 _amount) public {
        require(_collectionNameToId[collectionName] < _collectionIdCounter, "Invalid collection name");
        uint256 priceInSmallestUnit = _price * 10**18;
        uint256 requiredAmount = priceInSmallestUnit * _amount;
        uint256 allowance = cUSD.allowance(msg.sender, address(this));
        require(allowance >= requiredAmount, "ERC20: transfer amount exceeds allowance");
        require(cUSD.transferFrom(msg.sender, address(this), requiredAmount), "Transfer failed");
        uint256 collectionId = _collectionNameToId[collectionName];
        uint256 originalValidityTime = block.timestamp + _collections[collectionId].validityMinutes * 1 minutes;
        buyOrders[buyOrderCounter] = BuyOrder(msg.sender, collectionName, _amount, priceInSmallestUnit, "OPEN", buyOrderCounter);
        buyOrderCounter++;
    }

    function executeBuyOrder(uint256 _buyOrderCounter, uint256 _amount) public {
        BuyOrder memory order = buyOrders[_buyOrderCounter];
        require(keccak256(abi.encodePacked(order.status)) == keccak256(abi.encodePacked("OPEN")), "Order is not open.");
        require(order.amount >= _amount, "Insufficient amount of NFT!");

        uint256 totalAmount = 0;
        uint256 remainingAmount = _amount;

        TokenInfo[] storage sellerTokens = accountToTokens[msg.sender];
        for (uint i = 0; i < sellerTokens.length; i++) {
            if (sellerTokens[i].collectionId == _collectionNameToId[order.collectionName]) {
                checkTokenValidity(sellerTokens[i].tokenId);

                uint256 tokenIdToTransfer = sellerTokens[i].tokenId;
                uint256 amountToTransfer = sellerTokens[i].amount < remainingAmount ? sellerTokens[i].amount : remainingAmount;

                _safeTransferFrom(msg.sender, order.buyer, tokenIdToTransfer, amountToTransfer, "");

                uint256 copiedValidityTime = sellerTokens[i].validityTime;

                bool tokenInfoExists = false;
                for (uint j = 0; j < accountToTokens[order.buyer].length; j++) {
                    if (accountToTokens[order.buyer][j].tokenId == tokenIdToTransfer) {
                        accountToTokens[order.buyer][j].amount += amountToTransfer;
                        tokenInfoExists = true;
                        break;
                    }
                }

                if (!tokenInfoExists) {
                    TokenInfo memory newTokenInfo = TokenInfo({
                        collectionId: _tokenIdToCollectionId[tokenIdToTransfer],
                        tokenId: tokenIdToTransfer,
                        amount: amountToTransfer,
                        validityTime: copiedValidityTime
                    });
                    accountToTokens[order.buyer].push(newTokenInfo);
                }

                sellerTokens[i].amount -= amountToTransfer;
                if (sellerTokens[i].amount == 0) {
                    sellerTokens[i] = sellerTokens[sellerTokens.length - 1];
                    sellerTokens.pop();
                }

                totalAmount += amountToTransfer;
                remainingAmount -= amountToTransfer;

                if (remainingAmount == 0) {
                    break;
                }
            }
        }

        require(totalAmount == _amount, "Insufficient tokens to fulfill the order.");

        uint256 daiAmount = _amount * order.price;
        require(cUSD.transfer(msg.sender, daiAmount), "DAI transfer failed");

        buyOrders[_buyOrderCounter].amount -= _amount;
        buyOrders[_buyOrderCounter].status = buyOrders[_buyOrderCounter].amount == 0 ? "EXECUTED" : "OPEN";
    }

    function executeSellOrder(uint256 _sellOrderCounter, uint256 _amount) public {
        SellOrder memory order = sellOrders[_sellOrderCounter];
        require(keccak256(abi.encodePacked(order.status)) == keccak256(abi.encodePacked("OPEN")), "Order is not open.");
        require(order.amount >= _amount, "Insufficient amount of NFT!");

        uint256 requiredAmount = order.price * _amount;
        uint256 allowance = cUSD.allowance(msg.sender, address(this));
        string memory instanceName = tokenIdToInstanceName[order.tokenId];
        require(allowance >= requiredAmount, "ERC20: transfer amount exceeds allowance");

        uint256 sellerAmount = requiredAmount;
        
        transferFromEscrow(order.collectionName, order.tokenId, _amount);

        uint256 copiedValidityTime = tokenIdToTokenInfo[order.tokenId].validityTime;
        bool tokenInfoExists = false;
        TokenInfo[] storage buyerTokens = accountToTokens[msg.sender];
        for (uint i = 0; i < buyerTokens.length; i++) {
            if (buyerTokens[i].tokenId == order.tokenId) {
                buyerTokens[i].amount += _amount;
                tokenInfoExists = true;
                break;
            }
        }

        if (!tokenInfoExists) {
            TokenInfo memory newTokenInfo = TokenInfo({
                collectionId: _tokenIdToCollectionId[order.tokenId],
                tokenId: order.tokenId,
                amount: _amount,
                validityTime: copiedValidityTime
            });
            buyerTokens.push(newTokenInfo);
        }

        sellOrders[_sellOrderCounter].amount -= _amount;
        sellOrders[_sellOrderCounter].status = sellOrders[_sellOrderCounter].amount == 0 ? "EXECUTED" : "OPEN";
    }

    function getContractDaiBalance() public view returns (uint256) {
        return cUSD.balanceOf(address(this));
    }

    function getAllBuyOrders() public view returns (BuyOrder[] memory) {
        BuyOrder[] memory orders = new BuyOrder[](buyOrderCounter);
        for (uint256 i = 0; i < buyOrderCounter; i++) {
            orders[i] = buyOrders[i];
        }
        return orders;
    }

    function getAllSellOrders() public view returns (SellOrder[] memory) {
        SellOrder[] memory orders = new SellOrder[](sellOrderCounter);
        for (uint256 i = 0; i < sellOrderCounter; i++) {
            orders[i] = sellOrders[i];
        }
        return orders;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
