import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, MENU_ITEMS } from '../types/menuData';
import { CartItem, OrderItem, TableOrder, WaiterRequest, RestaurantGstProfile, StaffUser, RestaurantTable } from '../types/types';

interface AppContextType {

  // Restaurant Tables state
  restaurantTables: RestaurantTable[];
  addTable: (newTable: RestaurantTable) => void;
  updateTable: (tableId: string, updatedFields: Partial<RestaurantTable>) => void;
  deleteTable: (tableId: string) => void;
 

  // New Restaurant Coordination States (Shared globally)
  activeRole: 'guest' | 'owner' | 'manager' | 'waiter' | 'kitchen' | 'login';
  setActiveRole: (role: 'guest' | 'owner' | 'manager' | 'waiter' | 'kitchen' | 'login') => void;
  allOrders: TableOrder[];
  
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
  
}

const AppContext = createContext<AppContextType | undefined>(undefined);



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
  



  const [invoiceSequence, setInvoiceSequence] = useState<number>(() => {
    const saved = localStorage.getItem('hush_invoice_sequence');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('hush_invoice_sequence', invoiceSequence.toString());
  }, [invoiceSequence]);

  // COORDINATION STATES
  const [activeRole, setActiveRole] = useState<'guest' | 'owner' | 'manager' | 'waiter' | 'kitchen' | 'login'>('guest');
  




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

 

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('hush_all_orders', JSON.stringify(allOrders));
  }, [allOrders]);



 

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
   // setCart([]); // Clear customer's table cart as it is now submitted to the kitchen draft queue

    // Automatically trigger a Waiter Service Summon to highlight this draft order to waiters immediately
    const reqId = `req-draft-${Date.now()}`;
    const newRequest: WaiterRequest = {
      id: reqId,
      type: 'general',
      label: 'Draft Order Verification Placed',
      tableNumber: tableNum ?? 0,
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

 


  return (
    <AppContext.Provider
      value={{

        // Restaurant Tables State
        restaurantTables,
        addTable,
        updateTable,
        deleteTable,

        // New staff system hooks
        activeRole,
        setActiveRole,
        allOrders,
        submitDraftOrder,
        updateOrderItems,
        sendOrderToKitchen,
        updateOrderStatus,
        requestBillForTable,
        payBillForOrder,
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
