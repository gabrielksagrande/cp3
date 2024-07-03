import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cp1Abi from './cp1Abi.json';
import ExecuteBuyOrderComponent from './executeBuyOrder';

const GetAllBuyOrdersComponent = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchBuyOrders = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract('0xA963BbD9d9E71FfEF68e1E65556bBF4f30E200A9', cp1Abi, provider);
        const orders = await contract.getAllBuyOrders();
        const formattedOrders = orders.map(order => ({
          buyer: order.buyer,
          collectionName: order.collectionName,
          amount: order.amount.toNumber(),
          price: ethers.utils.formatUnits(order.price, 'ether'),
          status: order.status,
          buyOrderCounter: order.buyOrderCounter.toNumber()
        }));
        setBuyOrders(formattedOrders);
      }
    };
    fetchBuyOrders();
  }, []);

  const handleExecuteBuyOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div>
      <h2>All Buy Orders</h2>
      <ul>
        {buyOrders.map((order, index) => (
          <li key={index}>
            <p>Buyer: {order.buyer}</p>
            <p>Collection Name: {order.collectionName}</p>
            <p>Amount: {order.amount}</p>
            <p>Price: {order.price} cUSD</p>
            <p>Status: {order.status}</p>
            <p>Buy Order Counter: {order.buyOrderCounter}</p>
            <button onClick={() => handleExecuteBuyOrder(order)}>Execute Buy Order</button>
          </li>
        ))}
      </ul>
      {selectedOrder && <ExecuteBuyOrderComponent order={selectedOrder} />}
    </div>
  );
};

export default GetAllBuyOrdersComponent;
