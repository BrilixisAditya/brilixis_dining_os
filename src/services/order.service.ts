// services/order.service.ts

import {
    Order,
    OrderStatus,
    CreateOrderRequest,
    UpdateOrderRequest,
} from "../types/order_type";

/* -------------------------------------------------------------------------- */
/*                               ORDER QUERIES                                */
/* -------------------------------------------------------------------------- */

/**
 * Get all orders.
 */
export async function getOrders(): Promise<Order[]> {
    // TODO:
    // return api.get("/orders");

    return [];
}

/**
 * Get one order.
 */
export async function getOrderById(
    orderId: string
): Promise<Order | null> {

    // TODO:
    // return api.get(`/orders/${orderId}`);

    return null;
}

/**
 * Create new order.
 */
export async function createOrder(
    payload: CreateOrderRequest
): Promise<void> {

    // TODO:
    // POST /orders
}

/**
 * Update order.
 */
export async function updateOrder(
    orderId: string,
    payload: UpdateOrderRequest
): Promise<void> {

    // TODO:
    // PATCH /orders/{id}
}

/**
 * Cancel order.
 */
export async function cancelOrder(
    orderId: string
): Promise<void> {

    // TODO:
    // PATCH /orders/{id}/cancel
}

/* -------------------------------------------------------------------------- */
/*                             ORDER ITEM ACTIONS                             */
/* -------------------------------------------------------------------------- */

/**
 * Add item into existing order.
 */
export async function addOrderItem(
    orderId: string,
    itemId: string,
    quantity: number
): Promise<void> {

    // TODO:
    // POST /orders/{id}/items
}

/**
 * Update order item quantity.
 */
export async function updateOrderItem(
    orderItemId: string,
    quantity: number
): Promise<void> {

    // TODO:
    // PATCH /order-items/{id}
}

/**
 * Remove item.
 */
export async function removeOrderItem(
    orderItemId: string
): Promise<void> {

    // TODO:
    // DELETE /order-items/{id}
}

/* -------------------------------------------------------------------------- */
/*                               ORDER STATUS                                 */
/* -------------------------------------------------------------------------- */

export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus
): Promise<void> {

    // TODO:
    // PATCH /orders/{id}/status
}

/**
 * Waiter confirms order.
 */
export async function confirmOrder(
    orderId: string
): Promise<void> {

    // TODO
}

/**
 * Send order to kitchen.
 */
export async function sendToKitchen(
    orderId: string
): Promise<void> {

    // TODO
}

/**
 * Kitchen starts preparing.
 */
export async function startPreparing(
    orderId: string
): Promise<void> {

    // TODO
}

/**
 * Kitchen marks ready.
 */
export async function markReady(
    orderId: string
): Promise<void> {

    // TODO
}

/**
 * Waiter serves order.
 */
export async function markServed(
    orderId: string
): Promise<void> {

    // TODO
}

/**
 * Order completed.
 */
export async function completeOrder(
    orderId: string
): Promise<void> {

    // TODO
}

/* -------------------------------------------------------------------------- */
/*                             CUSTOMER ACTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * Customer requests bill.
 */
export async function requestBill(
    orderId: string
): Promise<void> {

    // TODO:
    // POST /orders/{id}/request-bill
}

/**
 * Customer reorders previous order.
 */
export async function reorder(
    previousOrderId: string
): Promise<void> {

    // TODO
}

/* -------------------------------------------------------------------------- */
/*                               WAITER ACTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * Assign waiter.
 */
export async function assignWaiter(
    orderId: string,
    waiterId: string
): Promise<void> {

    // TODO
}

/* -------------------------------------------------------------------------- */
/*                               FILTERS                                      */
/* -------------------------------------------------------------------------- */

export async function getOrdersByStatus(
    status: OrderStatus
): Promise<Order[]> {

    // TODO

    return [];
}

export async function getOrdersByTable(
    tableId: string
): Promise<Order[]> {

    // TODO

    return [];
}

export async function getOrdersByCustomer(
    customerId: string
): Promise<Order[]> {

    // TODO

    return [];
}