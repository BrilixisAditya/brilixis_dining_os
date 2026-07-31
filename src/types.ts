import { MenuItem } from './menuData';

export interface CartItem {
  id: string; // unique ID to support multiple versions of the same item with different ingredient exclusions
  menuItem: MenuItem;
  quantity: number;
  excludedIngredients: string[];
  addedIngredients: string[];
  customInstructions: string;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  excludedIngredients: string[];
  addedIngredients: string[];
  customInstructions: string;
}

export interface TableOrder {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: 'draft_submitted' | 'on_review' | 'sent_to_kitchen' | 'preparing' | 'ready' | 'served' | 'bill_requested' | 'paid';
  waiterName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerGstin?: string;
  companyName?: string;
  invoiceNumber?: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  paymentDetails?: {
    method: string;
    transactionId: string;
    paidAt: string;
  };
  gstSummary?: {
    totalTaxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
    roundOff: number;
    isInterstate: boolean;
  };
}

export interface WaiterRequest {
  id: string;
  type: 'general' | 'water' | 'cutlery' | 'menu' | 'bill' | 'tissue' | 'cleaning';
  label: string;
  tableNumber: number;
  status: 'requested' | 'assigned' | 'on_the_way' | 'resolved';
  waiterName?: string;
  etaString?: string;
}

export interface RestaurantGstProfile {
  restaurantName: string;
  legalBusinessName: string;
  gstin: string;
  fssaiNumber?: string;
  pan?: string;
  address: string;
  state: string;
  stateCode: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  invoicePrefix: string;
  financialYear: string;
  taxConfig: 'CGST_SGST' | 'IGST' | 'BOTH';
}

export interface StaffUser {
  id: string;
  name: string;
  role: string;
  rating: number;
  status: 'active' | 'break' | 'off_duty';
  efficiency: number;
  code: string;
  phone?: string;
}

export interface RestaurantTable {
  id: string;
  number: number;
  name: string;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved' | 'disabled';
}


