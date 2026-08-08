import { useState } from "react";
import { TableOrder } from "../types/types";

const useOrders = () => {
  const [orders, setOrders] = useState<TableOrder[]>([]);

  function createOrder() {
    // TODO order.service.ts
  }

  function updateOrder() {
    // TODO
  }

  function cancelOrder() {
    // TODO
  }

  function sendToKitchen() {
    // TODO
  }

  function markPreparing() {
    // TODO
  }

  function markReady() {
    // TODO
  }

  function markServed() {
    // TODO
  }

  function completeOrder() {
    // TODO
  }

  return {orders, createOrder, updateOrder, cancelOrder, sendToKitchen, markPreparing, markReady, markServed, completeOrder};
};

export default useOrders;
