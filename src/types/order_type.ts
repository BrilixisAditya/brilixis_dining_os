export interface Order {

    id: string;

    diningSessionId: string;

    customerId?: string;

    status: OrderStatus;

    subtotal: number;

    taxAmount: number;

    discountAmount: number;

    grandTotal: number;

    createdAt: string;
}

export interface OrderItem {

    id: string;

    orderId: string;

    menuItemId: string;

    quantity: number;

    basePrice: number;

    modifierPrice: number;

    lineTotal: number;

    notes?: string;
}


export interface OrderItemModifier {

    id: string;

    orderItemId: string;

    modifierItemId: string;

    quantity: number;

    price: number;
}

export interface CreateOrderRequest {

    diningSessionId: string;

    customerId?: string;

    items: CreateOrderItemRequest[];
}


export interface CreateOrderItemRequest {
    menuItemId: string;

    quantity: number;

    notes?: string;

    modifiers: CreateOrderItemModifierRequest[];
}


export interface CreateOrderItemModifierRequest {
    modifierItemId: string;

    quantity: number;
}



export interface UpdateOrderRequest {

    status?: OrderStatus;

    notes?: string;
}

export type OrderStatus =
    | "DRAFT"
    | "WAITING_CONFIRMATION"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "SERVED"
    | "COMPLETED"
    | "CANCELLED";