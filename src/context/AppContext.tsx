import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, MENU_ITEMS } from '../menuData';
import { CartItem, OrderItem, TableOrder, WaiterRequest, RestaurantGstProfile, StaffUser, RestaurantTable } from '../types';

interface AppContextType {
  tableNumber: number;
  setTableNumber: (num: number) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number, excluded: string[], added: string[], notes: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isTableSwitcherOpen: boolean;
  setIsTableSwitcherOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  
  // Dynamic Menu Items state
  menuItems: MenuItem[];
  addMenuItem: (newItem: MenuItem) => void;
  updateMenuItem: (itemId: string, updatedFields: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
  
  // Staff Users state
  staffUsers: StaffUser[];
  addStaffUser: (newUser: StaffUser) => void;
  updateStaffUser: (userId: string, updatedFields: Partial<StaffUser>) => void;
  deleteStaffUser: (userId: string) => void;

  // Restaurant Tables state
  restaurantTables: RestaurantTable[];
  addTable: (newTable: RestaurantTable) => void;
  updateTable: (tableId: string, updatedFields: Partial<RestaurantTable>) => void;
  deleteTable: (tableId: string) => void;

  // Guest active tableside waiter request
  waiterRequest: WaiterRequest | null;
  triggerCallWaiter: (type: WaiterRequest['type'], label: string) => void;
  cancelWaiterRequest: () => void;

  // New Restaurant Coordination States (Shared globally)
  activeRole: 'guest' | 'owner' | 'manager' | 'waiter' | 'kitchen' | 'login';
  setActiveRole: (role: 'guest' | 'owner' | 'manager' | 'waiter' | 'kitchen' | 'login') => void;
  allOrders: TableOrder[];
  allWaiterRequests: WaiterRequest[];
  
  // Restaurant side action handlers
  submitDraftOrder: (tableNum: number) => string;
  updateOrderItems: (orderId: string, items: OrderItem[]) => void;
  sendOrderToKitchen: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: TableOrder['status']) => void;
  requestBillForTable: (tableNum: number) => void;
  payBillForOrder: (
    orderId: string,
    customerName: string,
    customerPhone: string,
    customerEmail?: string,
    customerGstin?: string,
    companyName?: string,
    discount?: number
  ) => void;
  assignWaiterToCall: (requestId: string, waiterName: string) => void;
  resolveWaiterCall: (requestId: string) => void;
  restaurantGstProfile: RestaurantGstProfile;
  updateRestaurantGstProfile: (profile: RestaurantGstProfile) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_STAFF_USERS: StaffUser[] = [
  { id: 'stf-01', name: 'Devi Patel', role: 'Executive Steward', rating: 4.93, status: 'active', efficiency: 98, code: 'PIN 2024', phone: '+91 9876543210' },
  { id: 'stf-02', name: 'Alex Thorne', role: 'Senior Table Steward', rating: 4.88, status: 'active', efficiency: 95, code: 'PIN 3030', phone: '+91 9876543211' },
  { id: 'stf-03', name: 'Yuki Sato', role: 'Dine Floor Steward', rating: 4.85, status: 'break', efficiency: 92, code: 'PIN 4040', phone: '+91 9876543212' },
  { id: 'stf-04', name: 'Elena Rostova', role: 'Hostess Steward', rating: 4.96, status: 'active', efficiency: 99, code: 'PIN 5050', phone: '+91 9876543213' },
  { id: 'stf-05', name: 'James Sinclair', role: 'Tableside Steward', rating: 4.79, status: 'active', efficiency: 89, code: 'PIN 6060', phone: '+91 9876543214' },
  { id: 'stf-06', name: 'Rajeev Kapoor', role: 'Executive Chef', rating: 4.91, status: 'active', efficiency: 97, code: 'PIN 7070', phone: '+91 9876543215' }
];

const DEFAULT_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', number: 1, name: 'Table 01', capacity: 2, section: 'Main Dining', status: 'available' },
  { id: 'tbl-2', number: 2, name: 'Table 02', capacity: 4, section: 'Main Dining', status: 'occupied' },
  { id: 'tbl-3', number: 3, name: 'Table 03', capacity: 4, section: 'Main Dining', status: 'available' },
  { id: 'tbl-4', number: 4, name: 'Table 04', capacity: 6, section: 'Main Dining', status: 'occupied' },
  { id: 'tbl-5', number: 5, name: 'Table 05', capacity: 2, section: 'Window Corner', status: 'available' },
  { id: 'tbl-6', number: 6, name: 'Table 06', capacity: 8, section: 'VIP Banquet', status: 'reserved' },
  { id: 'tbl-7', number: 7, name: 'Table 07', capacity: 4, section: 'Outdoor Terrace', status: 'available' },
  { id: 'tbl-8', number: 8, name: 'Table 08', capacity: 4, section: 'Outdoor Terrace', status: 'available' },
  { id: 'tbl-9', number: 9, name: 'Table 09', capacity: 2, section: 'Bar Lounge', status: 'occupied' },
  { id: 'tbl-10', number: 10, name: 'Table 10', capacity: 6, section: 'VIP Banquet', status: 'available' }
];

// Generate Mock Data for Owner/Manager dashboards
const generateMockOrders = (): TableOrder[] => {
  const mockOrders: TableOrder[] = [];
  const waiterNames = ['Alex Thorne', 'Yuki Sato', 'Elena Rostova', 'Devi Patel', 'James Sinclair'];
  const customerNames = ['Aarav Mehta', 'Ananya Iyer', 'Rohan Sharma', 'Priya Patel', 'Kabir Verma', 'Diya Joshi', 'Sid Malhotra', 'Sanya Sen'];
  
  // Past 3 days of historical receipts
  const itemPool = MENU_ITEMS;
  
  for (let i = 0; i < 24; i++) {
    const tableNum = Math.floor(Math.random() * 10) + 1;
    const waiterName = waiterNames[Math.floor(Math.random() * waiterNames.length)];
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const phoneNum = `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    // Choose 2-4 random items
    const numItems = Math.floor(Math.random() * 3) + 2;
    const selectedItems: OrderItem[] = [];
    let subtotal = 0;
    
    const usedIndices = new Set();
    while (selectedItems.length < numItems) {
      const randIdx = Math.floor(Math.random() * itemPool.length);
      if (!usedIndices.has(randIdx)) {
        usedIndices.add(randIdx);
        const item = itemPool[randIdx];
        const qty = Math.floor(Math.random() * 2) + 1;
        const addOns = Math.random() > 0.6 ? ['Pure Cow Ghee Drizzle'] : [];
        const excluded = Math.random() > 0.85 ? ['Onions'] : [];
        
        const extraCharges = addOns.length * 50;
        const itemTotal = (item.price + extraCharges) * qty;
        subtotal += itemTotal;
        
        selectedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItem: item,
          quantity: qty,
          excludedIngredients: excluded,
          addedIngredients: addOns,
          customInstructions: Math.random() > 0.7 ? 'Make it extra spicy' : '',
        });
      }
    }
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    // Stagger dates in past 48 hours
    const date = new Date();
    date.setHours(date.getHours() - Math.floor(Math.random() * 72) - 1);
    
    mockOrders.push({
      id: `ord-hist-${1000 + i}`,
      tableNumber: tableNum,
      items: selectedItems,
      status: 'paid',
      waiterName,
      customerName,
      customerPhone: phoneNum,
      createdAt: date.toISOString(),
      subtotal,
      tax,
      total,
      discount: 0,
      paymentDetails: {
        method: ['UPI / QR Code', 'Credit Card', 'Netbanking'][Math.floor(Math.random() * 3)],
        transactionId: `txn_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        paidAt: new Date(date.getTime() + 1800000).toISOString(), // paid 30 min later
      }
    });
  }
  
  return mockOrders;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableNumber, setTableNumberState] = useState<number>(5);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTableSwitcherOpen, setIsTableSwitcherOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('starters');
  
  // Single active pager for the currently simulated guest table
  const [waiterRequest, setWaiterRequest] = useState<WaiterRequest | null>(null);

  // Restaurant GST Profile State
  const [restaurantGstProfile, setRestaurantGstProfile] = useState<RestaurantGstProfile>(() => {
    const saved = localStorage.getItem('hush_gst_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      restaurantName: 'Hush Dine & Lounge',
      legalBusinessName: 'Hush Hospitality Private Limited',
      gstin: '27AAPCH1234F1Z5',
      fssaiNumber: '12345678901234',
      pan: 'AAPCH1234F',
      address: 'Level 4, Zenith Towers, Senapati Bapat Marg, Lower Parel',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400013',
      phoneNumber: '+91 98765 43210',
      email: 'billing@hushdine.com',
      invoicePrefix: 'INV-2026',
      financialYear: '2026-27',
      taxConfig: 'BOTH'
    };
  });

  useEffect(() => {
    localStorage.setItem('hush_gst_profile', JSON.stringify(restaurantGstProfile));
  }, [restaurantGstProfile]);

  const updateRestaurantGstProfile = (profile: RestaurantGstProfile) => {
    setRestaurantGstProfile(profile);
  };

  const [invoiceSequence, setInvoiceSequence] = useState<number>(() => {
    const saved = localStorage.getItem('hush_invoice_sequence');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('hush_invoice_sequence', invoiceSequence.toString());
  }, [invoiceSequence]);

  // COORDINATION STATES
  const [activeRole, setActiveRole] = useState<'guest' | 'owner' | 'manager' | 'waiter' | 'kitchen' | 'login'>('guest');
  
  // Dynamic Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('hush_menu_items');
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('hush_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  const addMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const updateMenuItem = (itemId: string, updatedFields: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Dynamic Staff Users State
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('hush_staff_users');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF_USERS;
  });

  useEffect(() => {
    localStorage.setItem('hush_staff_users', JSON.stringify(staffUsers));
  }, [staffUsers]);

  const addStaffUser = (newUser: StaffUser) => {
    setStaffUsers((prev) => [newUser, ...prev]);
  };

  const updateStaffUser = (userId: string, updatedFields: Partial<StaffUser>) => {
    setStaffUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u))
    );
  };

  const deleteStaffUser = (userId: string) => {
    setStaffUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Dynamic Restaurant Tables State
  const [restaurantTables, setRestaurantTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem('hush_restaurant_tables');
    return saved ? JSON.parse(saved) : DEFAULT_TABLES;
  });

  useEffect(() => {
    localStorage.setItem('hush_restaurant_tables', JSON.stringify(restaurantTables));
  }, [restaurantTables]);

  const addTable = (newTable: RestaurantTable) => {
    setRestaurantTables((prev) => [...prev, newTable].sort((a, b) => a.number - b.number));
  };

  const updateTable = (tableId: string, updatedFields: Partial<RestaurantTable>) => {
    setRestaurantTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, ...updatedFields } : t))
    );
  };

  const deleteTable = (tableId: string) => {
    setRestaurantTables((prev) => prev.filter((t) => t.id !== tableId));
  };
  
  // Seed state with mock orders + store in localStorage to persist across simulation role switches
  const [allOrders, setAllOrders] = useState<TableOrder[]>(() => {
    const saved = localStorage.getItem('hush_all_orders');
    return saved ? JSON.parse(saved) : generateMockOrders();
  });

  const [allWaiterRequests, setAllWaiterRequests] = useState<WaiterRequest[]>(() => {
    const saved = localStorage.getItem('hush_all_waiter_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('hush_all_orders', JSON.stringify(allOrders));
  }, [allOrders]);

  useEffect(() => {
    localStorage.setItem('hush_all_waiter_requests', JSON.stringify(allWaiterRequests));
  }, [allWaiterRequests]);

  // Sync Guest specific WaiterRequest based on this table's status in allWaiterRequests
  useEffect(() => {
    const matchingReq = allWaiterRequests.find(
      (r) => r.tableNumber === tableNumber && r.status !== 'resolved'
    );
    if (matchingReq) {
      setWaiterRequest(matchingReq);
    } else {
      // Look for a resolved request that hasn't been dismissed yet to show resolution state
      const resolvedReq = allWaiterRequests.find(
        (r) => r.tableNumber === tableNumber && r.status === 'resolved'
      );
      if (resolvedReq) {
        setWaiterRequest(resolvedReq);
      } else {
        setWaiterRequest(null);
      }
    }
  }, [allWaiterRequests, tableNumber]);

  // Parse table number and admin role routing from URL on load and popstate
  useEffect(() => {
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam) {
        const parsed = parseInt(tableParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
          setTableNumberState(parsed);
        }
      }

      const roleParam = params.get('role') || params.get('mode');
      const isPathAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
      if (roleParam === 'admin' || roleParam === 'staff' || params.has('admin') || isPathAdmin) {
        setActiveRole('login');
      }
    };

    checkUrl();
    window.addEventListener('popstate', checkUrl);
    window.addEventListener('hashchange', checkUrl);
    return () => {
      window.removeEventListener('popstate', checkUrl);
      window.removeEventListener('hashchange', checkUrl);
    };
  }, []);

  const setTableNumber = (num: number) => {
    if (num >= 1 && num <= 10) {
      setTableNumberState(num);
      const newUrl = `${window.location.pathname}?table=${num}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  };

  const addToCart = (
    item: MenuItem,
    quantity: number,
    excluded: string[],
    added: string[],
    notes: string
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.menuItem.id === item.id &&
          JSON.stringify(cartItem.excludedIngredients.sort()) === JSON.stringify(excluded.sort()) &&
          JSON.stringify(cartItem.addedIngredients.sort()) === JSON.stringify(added.sort()) &&
          cartItem.customInstructions.trim().toLowerCase() === notes.trim().toLowerCase()
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItem: item,
        quantity,
        excludedIngredients: excluded,
        addedIngredients: added,
        customInstructions: notes,
      };

      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Waiter summoning triggered by Guest
  const triggerCallWaiter = (type: WaiterRequest['type'], label: string) => {
    const reqId = `req-${Date.now()}`;
    const newRequest: WaiterRequest = {
      id: reqId,
      type,
      label,
      tableNumber,
      status: 'requested',
    };

    setAllWaiterRequests((prev) => [...prev, newRequest]);

    // Simulate auto-assigned waiter background flow for active guest visual transitions
    setTimeout(() => {
      setAllWaiterRequests((currentList) => {
        return currentList.map((req) => {
          if (req.id === reqId && req.status === 'requested') {
            const waiters = ['Alex Thorne', 'Yuki Sato', 'Elena Rostova', 'Devi Patel', 'James Sinclair'];
            const randomWaiter = waiters[Math.floor(Math.random() * waiters.length)];
            return {
              ...req,
              status: 'assigned',
              waiterName: randomWaiter,
              etaString: '1 min',
            };
          }
          return req;
        });
      });
    }, 2500);

    setTimeout(() => {
      setAllWaiterRequests((currentList) => {
        return currentList.map((req) => {
          if (req.id === reqId && req.status === 'assigned') {
            return {
              ...req,
              status: 'on_the_way',
              etaString: '30 sec',
            };
          }
          return req;
        });
      });
    }, 5500);

    setTimeout(() => {
      setAllWaiterRequests((currentList) => {
        return currentList.map((req) => {
          if (req.id === reqId && req.status === 'on_the_way') {
            return {
              ...req,
              status: 'resolved',
            };
          }
          return req;
        });
      });
    }, 12000);
  };

  const cancelWaiterRequest = () => {
    // Remove or resolve it
    setAllWaiterRequests((prev) => prev.filter((r) => r.tableNumber !== tableNumber));
    setWaiterRequest(null);
  };

  // RESTAURANT SIDE INTERACTIVE HANDLERS

  // Guest submits the cart items, creating a Draft Order for Waiters to approve
  const submitDraftOrder = (tableNum: number): string => {
    if (cart.length === 0) return '';
    const orderId = `ord-${Date.now()}`;
    
    // Map CartItem format to OrderItem format
    const orderItems: OrderItem[] = cart.map((c) => ({
      id: c.id,
      menuItem: c.menuItem,
      quantity: c.quantity,
      excludedIngredients: c.excludedIngredients,
      addedIngredients: c.addedIngredients,
      customInstructions: c.customInstructions,
    }));

    let subtotal = 0;
    orderItems.forEach((it) => {
      const extraCharges = it.addedIngredients.length * 50;
      subtotal += (it.menuItem.price + extraCharges) * it.quantity;
    });

    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const newOrder: TableOrder = {
      id: orderId,
      tableNumber: tableNum,
      items: orderItems,
      status: 'draft_submitted',
      createdAt: new Date().toISOString(),
      subtotal,
      tax,
      total,
    };

    setAllOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear customer's table cart as it is now submitted to the kitchen draft queue

    // Automatically trigger a Waiter Service Summon to highlight this draft order to waiters immediately
    const reqId = `req-draft-${Date.now()}`;
    const newRequest: WaiterRequest = {
      id: reqId,
      type: 'general',
      label: 'Draft Order Verification Placed',
      tableNumber: tableNum,
      status: 'requested',
    };
    
    setAllWaiterRequests((prev) => [...prev, newRequest]);

    // Simulate auto waiter pickup to mimic active host service en-route
    setTimeout(() => {
      setAllWaiterRequests((currentList) => {
        return currentList.map((req) => {
          if (req.id === reqId && req.status === 'requested') {
            const waiters = ['Alex Thorne', 'Yuki Sato', 'Elena Rostova', 'Devi Patel', 'James Sinclair'];
            const randomWaiter = waiters[Math.floor(Math.random() * waiters.length)];
            
            // Link waiter immediately to the order as well
            setAllOrders((prevOrd) =>
              prevOrd.map((ord) => (ord.id === orderId ? { ...ord, waiterName: randomWaiter } : ord))
            );

            return {
              ...req,
              status: 'assigned',
              waiterName: randomWaiter,
              etaString: '1 min',
            };
          }
          return req;
        });
      });
    }, 2000);

    return orderId;
  };

  // Waiter edits high-end ingredients, items or sizes in the order
  const updateOrderItems = (orderId: string, updatedItems: OrderItem[]) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          let subtotal = 0;
          updatedItems.forEach((it) => {
            const extraCharges = it.addedIngredients.length * 50;
            subtotal += (it.menuItem.price + extraCharges) * it.quantity;
          });
          const tax = subtotal * 0.18;
          const total = subtotal + tax;

          return {
            ...ord,
            items: updatedItems,
            subtotal,
            tax,
            total,
          };
        }
        return ord;
      })
    );
  };

  // Waiter sends order to the Kitchen Terminal
  const sendOrderToKitchen = (orderId: string) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((ord) =>
        ord.id === orderId ? { ...ord, status: 'sent_to_kitchen' } : ord
      )
    );

    // Resolve any corresponding order verification summons
    setAllOrders((currentList) => {
      const parentOrder = currentList.find((o) => o.id === orderId);
      if (parentOrder) {
        setAllWaiterRequests((prevCalls) =>
          prevCalls.filter((c) => c.tableNumber !== parentOrder.tableNumber)
        );
      }
      return currentList;
    });
  };

  // General Status triggers (Kitchen, serving staff, billers)
  const updateOrderStatus = (orderId: string, status: TableOrder['status']) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  // Guest requests bill tableside
  const requestBillForTable = (tableNum: number) => {
    setAllOrders((prevOrders) => {
      // Locate newest un-paid order for this table
      const activeOrd = prevOrders.find((o) => o.tableNumber === tableNum && o.status !== 'paid');
      if (activeOrd) {
        return prevOrders.map((o) =>
          o.id === activeOrd.id ? { ...o, status: 'bill_requested' } : o
        );
      }
      return prevOrders;
    });

    // Fire waiter request for billing
    const reqId = `req-bill-${Date.now()}`;
    const newRequest: WaiterRequest = {
      id: reqId,
      type: 'bill',
      label: 'Request Printed Bill Invoice',
      tableNumber: tableNum,
      status: 'requested',
    };
    setAllWaiterRequests((prev) => [...prev, newRequest]);
  };

  // Customer completes Name & Phone authentication + paid through Gateway
  const payBillForOrder = (
    orderId: string,
    customerName: string,
    customerPhone: string,
    customerEmail?: string,
    customerGstin?: string,
    companyName?: string,
    discount: number = 0
  ) => {
    const nextSeq = invoiceSequence;
    setInvoiceSequence(prev => prev + 1);

    const generatedInvoiceNumber = `${restaurantGstProfile.invoicePrefix}-${nextSeq.toString().padStart(6, '0')}`;

    setAllOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          let totalTaxable = 0;
          let cgstTotal = 0;
          let sgstTotal = 0;
          let igstTotal = 0;

          const updatedItems = ord.items.map((it) => {
            const rate = it.menuItem.gstRate !== undefined ? it.menuItem.gstRate : 5;
            const hsn = it.menuItem.hsnCode || '996331';
            const isInclusive = it.menuItem.isTaxInclusive !== undefined ? it.menuItem.isTaxInclusive : true;

            const extraCharges = it.addedIngredients.length * 50;
            const singleUnitPrice = it.menuItem.price + extraCharges;
            const lineTotalBeforeTax = singleUnitPrice * it.quantity;

            let taxableVal = 0;
            let taxAmt = 0;

            if (isInclusive) {
              taxableVal = lineTotalBeforeTax / (1 + (rate / 100));
              taxAmt = lineTotalBeforeTax - taxableVal;
            } else {
              taxableVal = lineTotalBeforeTax;
              taxAmt = lineTotalBeforeTax * (rate / 100);
            }

            return {
              ...it,
              taxableValue: taxableVal,
              taxAmount: taxAmt,
              gstRate: rate,
              hsnCode: hsn,
            };
          });

          let isInterstate = false;
          if (customerGstin && customerGstin.trim().length >= 2 && restaurantGstProfile.gstin.trim().length >= 2) {
            const custStateCode = customerGstin.trim().substring(0, 2);
            const restStateCode = restaurantGstProfile.gstin.trim().substring(0, 2);
            if (custStateCode !== restStateCode) {
              isInterstate = true;
            }
          }

          updatedItems.forEach((it) => {
            const taxAmt = it.taxAmount;
            const taxableVal = it.taxableValue;

            totalTaxable += taxableVal;

            if (isInterstate) {
              igstTotal += taxAmt;
            } else {
              cgstTotal += taxAmt / 2;
              sgstTotal += taxAmt / 2;
            }
          });

          const totalGst = cgstTotal + sgstTotal + igstTotal;
          const grossAmount = totalTaxable + totalGst;
          
          const discountAmt = grossAmount * (discount / 100);
          const afterDiscount = grossAmount - discountAmt;
          
          const roundedTotal = Math.round(afterDiscount);
          const roundOff = roundedTotal - afterDiscount;

          return {
            ...ord,
            items: updatedItems as any,
            status: 'paid',
            customerName,
            customerPhone,
            customerEmail,
            customerGstin,
            companyName,
            invoiceNumber: generatedInvoiceNumber,
            subtotal: Number(totalTaxable.toFixed(2)),
            tax: Number(totalGst.toFixed(2)),
            discount: Number(discountAmt.toFixed(2)),
            total: roundedTotal,
            paymentDetails: {
              method: 'UPI Razorpay Secure Gateway',
              transactionId: `pay_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              paidAt: new Date().toISOString(),
            },
            gstSummary: {
              totalTaxable: Number(totalTaxable.toFixed(2)),
              cgst: Number(cgstTotal.toFixed(2)),
              sgst: Number(sgstTotal.toFixed(2)),
              igst: Number(igstTotal.toFixed(2)),
              totalGst: Number(totalGst.toFixed(2)),
              roundOff: Number(roundOff.toFixed(2)),
              isInterstate,
            },
          };
        }
        return ord;
      })
    );

    // Resolve any outstanding billing waiter calls for this table
    setAllOrders((currentList) => {
      const matchedOrd = currentList.find((o) => o.id === orderId);
      if (matchedOrd) {
        setAllWaiterRequests((prevCalls) =>
          prevCalls.filter((c) => c.tableNumber !== matchedOrd.tableNumber)
        );
      }
      return currentList;
    });
  };

  // Staff explicit assignments
  const assignWaiterToCall = (requestId: string, waiterName: string) => {
    setAllWaiterRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'assigned', waiterName, etaString: 'Inside Dining Area' }
          : r
      )
    );
  };

  const resolveWaiterCall = (requestId: string) => {
    setAllWaiterRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <AppContext.Provider
      value={{
        tableNumber,
        setTableNumber,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isTableSwitcherOpen,
        setIsTableSwitcherOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        activeCategory,
        setActiveCategory,
        
        // Dynamic Menu State
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,

        // Staff Users State
        staffUsers,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,

        // Restaurant Tables State
        restaurantTables,
        addTable,
        updateTable,
        deleteTable,
        
        // Guest pager
        waiterRequest,
        triggerCallWaiter,
        cancelWaiterRequest,

        // New staff system hooks
        activeRole,
        setActiveRole,
        allOrders,
        allWaiterRequests,
        submitDraftOrder,
        updateOrderItems,
        sendOrderToKitchen,
        updateOrderStatus,
        requestBillForTable,
        payBillForOrder,
        assignWaiterToCall,
        resolveWaiterCall,
        restaurantGstProfile,
        updateRestaurantGstProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
