import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRing, Check, Minus, Trash2, Edit3, 
  CheckCircle, PlusCircle, Search, LogOut, Plus 
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MENU_ITEMS, MenuItem } from '../../../types/menuData';
import { OrderItem, WaiterRequest } from '../../../types/types';
import useOrders from '@/src/hooks/useOrders';

export const WaiterTerminal: React.FC = () => {

    const [allWaiterRequests, setAllWaiterRequest] = useState<WaiterRequest[]>([]); 
    const updateOrderItems = (orderId: string, updatedItems: OrderItem[]) => {} 
    const sendOrderToKitchen = (id: string) => {}
    const updateOrderStatus = (id: string, status: string) => {}
    const resolveWaiterCall = (id: string) => {}
    const setActiveRole = (role: string) => {}
    const setTableNumber = (tblNumber: number) => {}


  const {orders: allOrders} = useOrders();

  // Picked waiter context
  const WAITER_NAME = 'Devi Patel'; 

  // Selected table to manage inside the console
  const [selectedTable, setSelectedTable] = useState<number>(5);
  
  // Search state inside Add Item dropdown
  const [newDishSearch, setNewDishSearch] = useState('');
  const [dishCategoryFilter, setDishCategoryFilter] = useState<'all' | 'starters' | 'appetizers' | 'main course' | 'beverages' | 'desserts'>('all');
  const [isAddingItemsOpen, setIsAddingItemsOpen] = useState(false);
  
  // Modifying active single dish state (Item Selector Overlay inside Waiter Portal)
  const [modifyingItemIdx, setModifyingItemIdx] = useState<number | null>(null);

  // Return to role selection terminal
  const handleExit = () => {
    setActiveRole('login');
  };

  // Get active order associated with the selected Table
  const activeOrder = useMemo(() => {
    // Return newest un-paid order
    return allOrders.find((o) => o.tableNumber === selectedTable && o.status !== 'paid') || null;
  }, [allOrders, selectedTable]);

  // List of tables and their active state status for representation
  const tableStatusList = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const num = i + 1;
      const waiterCall = allWaiterRequests.find(w => w.tableNumber === num);
      const activeOrd = allOrders.find(o => o.tableNumber === num && o.status !== 'paid');

      let status: 'vacant' | 'draft' | 'preparing' | 'ready' | 'served' | 'bill_requested' = 'vacant';
      let waiterLabel = '';

      if (activeOrd) {
        if (activeOrd.status === 'draft_submitted') status = 'draft';
        else if (activeOrd.status === 'sent_to_kitchen' || activeOrd.status === 'preparing') status = 'preparing';
        else if (activeOrd.status === 'ready') status = 'ready';
        else if (activeOrd.status === 'served') status = 'served';
        else if (activeOrd.status === 'bill_requested') status = 'bill_requested';
        waiterLabel = activeOrd.waiterName || '';
      } else if (waiterCall) {
        status = 'draft'; // Glow to attract host
      }

      return {
        num,
        status,
        hasCall: !!waiterCall,
        callLabel: waiterCall?.label || '',
        callType: waiterCall?.type || 'general',
        requestId: waiterCall?.id || '',
        waiterName: waiterLabel,
      };
    });
  }, [allOrders, allWaiterRequests]);

  // Handle manual additions, subtractions or changes to selected table items
  const handleUpdateQty = (itemIndex: number, newQty: number) => {
    if (!activeOrder) return;
    
    const updatedItems = [...activeOrder.items];
    if (newQty <= 0) {
      updatedItems.splice(itemIndex, 1);
    } else {
      updatedItems[itemIndex].quantity = newQty;
    }
    
    updateOrderItems(activeOrder.id, updatedItems);
  };

  const handleDeleteItem = (itemIndex: number) => {
    if (!activeOrder) return;
    const updatedItems = [...activeOrder.items];
    updatedItems.splice(itemIndex, 1);
    updateOrderItems(activeOrder.id, updatedItems);
  };

  // Add a brand new dish into the active order draft
  const handleAddDishToOrder = (dish: MenuItem) => {
    if (!activeOrder) return;

    // Check if item already exists with exact neutral configurations
    const existingIdx = activeOrder.items.findIndex(
      (it) => it.menuItem.id === dish.id && 
              it.excludedIngredients.length === 0 && 
              it.addedIngredients.length === 0 && 
              it.customInstructions === ''
    );

    const updatedItems = [...activeOrder.items];

    if (existingIdx > -1) {
      updatedItems[existingIdx].quantity += 1;
    } else {
      const newItem: OrderItem = {
        id: `ord-it-${dish.id}-${Date.now()}`,
        menuItem: dish,
        quantity: 1,
        excludedIngredients: [],
        addedIngredients: [],
        customInstructions: '',
      };
      updatedItems.push(newItem);
    }

    updateOrderItems(activeOrder.id, updatedItems);
    setIsAddingItemsOpen(false);
  };

  // Dish modify overrides (exclusions / premium toppings / custom descriptions)
  const openModifyingModal = (index: number) => {
    setModifyingItemIdx(index);
  };

  const handleToggleExclusion = (ingredient: string) => {
    if (!activeOrder || modifyingItemIdx === null) return;
    
    const item = activeOrder.items[modifyingItemIdx];
    const excluded = [...item.excludedIngredients];
    
    if (excluded.includes(ingredient)) {
      const idx = excluded.indexOf(ingredient);
      excluded.splice(idx, 1);
    } else {
      excluded.push(ingredient);
    }
    
    const updatedItems = [...activeOrder.items];
    updatedItems[modifyingItemIdx] = {
      ...item,
      excludedIngredients: excluded,
    };
    
    updateOrderItems(activeOrder.id, updatedItems);
  };

  const handleToggleAddition = (addition: string) => {
    if (!activeOrder || modifyingItemIdx === null) return;
    
    const item = activeOrder.items[modifyingItemIdx];
    const added = [...item.addedIngredients];
    
    if (added.includes(addition)) {
      const idx = added.indexOf(addition);
      added.splice(idx, 1);
    } else {
      added.push(addition);
    }
    
    const updatedItems = [...activeOrder.items];
    updatedItems[modifyingItemIdx] = {
      ...item,
      addedIngredients: added,
    };
    
    updateOrderItems(activeOrder.id, updatedItems);
  };

  const handleSaveNotes = (notes: string) => {
    if (!activeOrder || modifyingItemIdx === null) return;
    
    const item = activeOrder.items[modifyingItemIdx];
    const updatedItems = [...activeOrder.items];
    updatedItems[modifyingItemIdx] = {
      ...item,
      customInstructions: notes,
    };
    
    updateOrderItems(activeOrder.id, updatedItems);
  };

  // Search filtered dishes
  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(newDishSearch.toLowerCase()) || 
                          item.description.toLowerCase().includes(newDishSearch.toLowerCase());
      const matchCategory = dishCategoryFilter === 'all' || item.category === dishCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [newDishSearch, dishCategoryFilter]);

  return (
    <div className="space-y-8 p-4 md:p-6 text-[#2D2D2D]" id="waiter-page">
      {/* Upper Navigation Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-surface p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E76F51]/10 border border-[#E76F51]/20 flex items-center justify-center text-2xl">
            🛎️
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#E76F51] font-bold block">
              Tableside Steward Portal
            </span>
            <h2 className="text-xl font-display font-black text-[#2D2D2D] tracking-tight">
              Waiter Service Terminal
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] uppercase border font-mono font-bold bg-[#FFFDF8] border-[#ECE7E1] px-3 py-1.5 rounded-full text-[#6B7280]">
            Logged in: <span className="text-[#E76F51]">{WAITER_NAME}</span>
          </span>
          <button
            onClick={handleExit}
            className="btn-outline flex items-center gap-2 px-4 py-2 text-xs"
            id="waiter-exit-btn"
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      </div>

      {/* Main Waiter Double Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="waiter-grid-work">
        
        {/* Left Hand: Pagers & Tables status (Column 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Live Tables Summons Checklists */}
          <div className="card-surface p-6" id="waiter-pagers-panel">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <h3 className="text-sm font-display font-black text-[#2D2D2D]">
                Live Beacons Checklist
              </h3>
            </div>

            {allWaiterRequests.length === 0 ? (
              <div className="text-center py-8 bg-[#FFFDF8] rounded-2xl border border-dashed border-[#ECE7E1] p-4 text-[#6B7280] text-[11px] font-mono">
                No active waiter requests currently.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1" id="summons-scroll">
                {allWaiterRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="p-3.5 bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl flex items-center justify-between gap-3 shadow-brilixis-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-black text-[#E76F51] bg-white border border-[#E76F51]/15 px-2 py-0.5 rounded-md">
                          TBL {req.tableNumber.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-[#6B7280] font-mono uppercase font-bold">
                          {req.type}
                        </span>
                      </div>
                      <p className="text-xs font-display font-extrabold text-[#2D2D2D] truncate">
                        {req.label}
                      </p>
                    </div>

                    <button
                      onClick={() => resolveWaiterCall(req.id)}
                      className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-transparent transition-colors cursor-pointer"
                      title="Clear Request Call"
                    >
                      <Check size={13} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Visual Table Monitor Matrix */}
          <div className="card-surface p-6" id="tables-status-panel">
            <div className="mb-4">
              <h3 className="text-sm font-display font-black text-[#2D2D2D]">
                Dining Hall Visual Monitor
              </h3>
              <p className="text-[10px] text-[#6B7280] mt-0.5 font-mono">
                COLOR KEY: <span className="text-emerald-600 font-bold">Vacant</span> • <span className="text-amber-500 font-bold">Draft Check</span> • <span className="text-orange-600 font-bold">Cooking</span> • <span className="text-blue-700 font-bold">Bill Request</span>
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2.5" id="waiter-table-tiles">
              {tableStatusList.map((tbl) => {
                const isSelected = tbl.num === selectedTable;
                
                // Color mapping
                let dotClr = 'bg-emerald-500';
                let cardBorders = 'border-[#ECE7E1] bg-white';
                if (tbl.status === 'draft') {
                  dotClr = 'bg-amber-500 animate-pulse';
                  cardBorders = 'border-amber-300 bg-amber-50/20';
                } else if (tbl.status === 'preparing') {
                  dotClr = 'bg-orange-500';
                  cardBorders = 'border-orange-200 bg-orange-50/10';
                } else if (tbl.status === 'ready' || tbl.status === 'served') {
                  dotClr = 'bg-[#6B7280]';
                  cardBorders = 'border-neutral-200 bg-neutral-50/30';
                } else if (tbl.status === 'bill_requested') {
                  dotClr = 'bg-blue-600 animate-pulse';
                  cardBorders = 'border-blue-300 bg-blue-50/15';
                }

                if (isSelected) {
                  cardBorders = 'ring-2 ring-[#E76F51] border-transparent bg-white scale-102';
                }

                return (
                  <button
                    key={tbl.num}
                    onClick={() => { setSelectedTable(tbl.num); setTableNumber(tbl.num); }}
                    className={`aspect-square rounded-2xl flex flex-col justify-center items-center relative transition-all duration-300 shadow-brilixis-sm cursor-pointer ${cardBorders}`}
                    id={`waiter-tbl-tile-${tbl.num}`}
                  >
                    <span className="text-[9px] font-mono text-[#6B7280] font-bold">T-{tbl.num.toString().padStart(2, '0')}</span>
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${dotClr}`} />
                    
                    {tbl.hasCall && (
                      <span className="absolute -top-1 -right-1 p-0.5 bg-rose-600 text-white rounded-full text-[8px]">
                        <BellRing size={7} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Hand: Active Editor canvas (Column 7) */}
        <div className="lg:col-span-7 card-surface p-6 flex flex-col justify-between min-h-[460px]" id="waiter-editor-panel">
          
          <div>
            {/* Header summary of selected table */}
            <div className="flex justify-between items-center pb-4 border-b border-[#ECE7E1] mb-4">
              <div>
                <h3 className="text-base font-display font-black text-[#2D2D2D]">
                  Active Details for Table {selectedTable.toString().padStart(2, '0')}
                </h3>
                <span className="text-[10px] uppercase font-mono bg-neutral-100 text-[#2D2D2D] px-2 py-0.5 rounded-md inline-block mt-0.5">
                  Status: {activeOrder ? activeOrder.status.replace('_', ' ') : 'Table Vacant'}
                </span>
              </div>
              
              {activeOrder && (
                <div className="text-right font-mono font-extrabold text-[#E76F51] text-sm">
                  Subtotal: ₹{activeOrder.subtotal}
                </div>
              )}
            </div>

            {/* Logical branches based on table state */}
            {!activeOrder ? (
              /* Scenario A: No active invoice draft */
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <span className="text-4xl mb-4">🍽️</span>
                <h4 className="text-sm font-display font-bold text-[#2D2D2D]">
                  No Active Guests Order Placed
                </h4>
                <p className="text-xs text-[#6B7280] max-w-xs mt-1.5">
                  Guest is currently browsing. To simulate order drafts, go back to GUEST mode, add items to cart, and click "Submit Draft Order".
                </p>
              </div>
            ) : (
              /* Scenario B: ACTIVE ORDER LISTS */
              <div className="space-y-4">
                
                {/* Scrollable list of ordered items */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar" id="waiter-order-items-list">
                  {activeOrder.items.map((it, idx) => {
                    return (
                      <div key={it.id} className="p-3.5 bg-[#FFFDF8] border border-[#ECE7E1] rounded-2xl flex justify-between items-center gap-3">
                        
                        {/* Title details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full flex-none ${it.menuItem.isVeg ? 'bg-emerald-500' : 'bg-[#E76F51]'}`} />
                            <h4 className="text-xs font-display font-black text-[#2D2D2D] truncate">
                              {it.menuItem.name}
                            </h4>
                          </div>
                          
                          {/* Selected Exclusions and Extras */}
                          <div className="space-y-1 mt-1.5">
                            {it.excludedIngredients.map((ex) => (
                              <span key={ex} className="text-[9px] font-mono uppercase bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded inline-block mr-1">
                                ✕ No {ex}
                              </span>
                            ))}
                            {it.addedIngredients.map((ad) => (
                              <span key={ad} className="text-[9px] font-mono uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded inline-block mr-1 font-bold">
                                ✓ Add {ad} (+₹50)
                              </span>
                            ))}
                            {it.customInstructions && (
                              <p className="text-[9px] text-[#6B7280] italic font-medium leading-none mt-1">
                                Notes: "{it.customInstructions}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls (Qty / Deletion) */}
                        <div className="flex items-center gap-3 flex-none">
                          <div className="flex items-center bg-white border border-[#ECE7E1] rounded-xl overflow-hidden shadow-brilixis-sm">
                            <button
                              onClick={() => handleUpdateQty(idx, it.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#E76F51] cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center font-mono text-xs font-bold text-[#2D2D2D]">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(idx, it.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#E76F51] cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <button
                            onClick={() => openModifyingModal(idx)}
                            className="btn-icon p-1.5 rounded-lg border border-[#ECE7E1] bg-white"
                            title="Exclusions / Addons / Notes"
                          >
                            <Edit3 size={11} />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#E76F51] transition-colors cursor-pointer mr-0.5"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Submenu: Add more dishes to order */}
                <div id="add-more-dishes-box">
                  {!isAddingItemsOpen ? (
                    <button
                      onClick={() => setIsAddingItemsOpen(true)}
                      className="w-full py-3.5 border border-dashed border-[#ECE7E1] hover:border-[#E76F51]/50 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-display font-extrabold text-[#6B7280] hover:text-[#E76F51] transition-all bg-[#FFFDF8] cursor-pointer"
                      id="waiter-add-items-toggle"
                    >
                      <PlusCircle size={14} /> Add New Dish To Table
                    </button>
                  ) : (
                    <div className="p-4 rounded-3xl border border-[#ECE7E1] bg-[#FFFDF8] space-y-3.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-display font-black text-[#2D2D2D]">
                          Add Items Menu Registry
                        </h4>
                        <button
                          onClick={() => setIsAddingItemsOpen(false)}
                          className="text-[10px] font-mono text-[#6B7280] hover:text-[#E76F51]"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Mini Toolbar filters */}
                      <div className="flex gap-2.5 items-center">
                        <div className="relative flex-1">
                          <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                          <input
                            type="text"
                            placeholder="Find gourmet recipe..."
                            value={newDishSearch}
                            onChange={(e) => setNewDishSearch(e.target.value)}
                            className="input-field pl-8 pr-3 py-1.5 text-[10px]"
                          />
                        </div>
                        <select
                          value={dishCategoryFilter}
                          onChange={(e: any) => setDishCategoryFilter(e.target.value)}
                          className="input-field px-2.5 py-1.5 text-[10px]"
                        >
                          <option value="all">All Items</option>
                          <option value="starters">Starters</option>
                          <option value="appetizers">Appetizers</option>
                          <option value="main course">Main</option>
                          <option value="beverages">Beverages</option>
                          <option value="desserts">Dessert</option>
                        </select>
                      </div>

                      {/* Tiny scrollable matching results */}
                      <div className="max-h-[140px] overflow-y-auto space-y-1.5 no-scrollbar pr-1">
                        {filteredDishes.slice(0, 10).map((dish) => (
                          <div key={dish.id} className="flex justify-between items-center bg-white border border-[#ECE7E1] p-2 rounded-xl text-[11px]">
                            <span className="font-bold truncate max-w-[170px]">{dish.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-[#6B7280]">₹{dish.price}</span>
                              <button
                                onClick={() => handleAddDishToOrder(dish)}
                                className="btn-primary px-2 py-1 text-[9px]"
                              >
                                Inject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Core Footer Commands */}
          {activeOrder && (
            <div className="mt-8 pt-4 border-t border-[#ECE7E1] flex justify-between items-center gap-4">
              <div className="leading-tight">
                <span className="text-[9px] font-mono text-[#6B7280] uppercase block">Total Bill (inc 18% Tax)</span>
                <span className="text-base font-mono font-bold text-[#2D2D2D]">₹{Math.round(activeOrder.total)}</span>
              </div>

              {activeOrder.status === 'draft_submitted' || activeOrder.status === 'on_review' ? (
                <button
                  onClick={() => sendOrderToKitchen(activeOrder.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-[10px] uppercase font-display font-bold tracking-wider hover:scale-101 transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/10"
                  id="approve-to-kitchen-btn"
                >
                  <CheckCircle size={13} /> Verify & Send to Kitchen
                </button>
              ) : activeOrder.status === 'served' || activeOrder.status === 'bill_requested' ? (
                <div className="text-xs text-emerald-800 font-display font-bold bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-150 flex items-center gap-1.5 select-none font-sans">
                  <CheckCircle size={13} className="text-emerald-500 animate-pulse" /> Order Served (Awaiting Diner Payment)
                </div>
              ) : (
                <div className="flex items-center gap-2" id="waiter-kot-actions">
                  <div className="text-[10px] text-[#6B7280] italic font-mono bg-[#FFFDF8] px-3 py-2 rounded-xl border border-[#ECE7E1] leading-none select-none">
                    KOT Active: <span className="font-extrabold text-[#2D2D2D]">{activeOrder.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => updateOrderStatus(activeOrder.id, 'served')}
                    className="btn-primary px-4 py-2 text-[10px] uppercase"
                    title="Mark order as served and deliver bills"
                  >
                    Deliver & Settle 🍽️
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* --- INLINE OVERLAY FOR ITEM EXCLUSIONS / TOPPINGS MODIFIER --- */}
      <AnimatePresence>
        {modifyingItemIdx !== null && activeOrder && activeOrder.items[modifyingItemIdx] && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setModifyingItemIdx(null)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="fixed inset-x-4 top-24 max-w-sm mx-auto bg-white border border-[#ECE7E1] rounded-[2rem] p-6 z-50 shadow-2xl text-[#2D2D2D]"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-display font-black text-[#2D2D2D] uppercase">
                  Adjust: {activeOrder.items[modifyingItemIdx].menuItem.name}
                </h4>
                <button 
                  onClick={() => setModifyingItemIdx(null)} 
                  className="text-xs font-mono font-bold text-[#6B7280] hover:text-[#E76F51]"
                >
                  ✕ Close
                </button>
              </div>

              {/* Exclusion Panel */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-[10px] font-mono text-[#6B7280] uppercase font-bold mb-2">Exclusions</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {activeOrder.items[modifyingItemIdx].menuItem.ingredients.map((ing:any) => {
                      const isExcluded = activeOrder.items[modifyingItemIdx].excludedIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          onClick={() => handleToggleExclusion(ing)}
                          className={`p-2.5 rounded-xl text-left text-xs font-display font-semibold border transition-all ${
                            isExcluded 
                              ? 'border-rose-400 bg-rose-50/20 text-rose-700' 
                              : 'border-[#ECE7E1] bg-[#FFFDF8] text-neutral-700 hover:bg-white'
                          }`}
                        >
                          {isExcluded ? '✕ exclude ' : '✓ keep '} {ing}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toppings Addition Panel */}
                <div>
                  <h5 className="text-[10px] font-mono text-[#6B7280] uppercase font-bold mb-2">Gourmet Enhancements (+₹50 each)</h5>
                  <div className="space-y-2">
                    {['Pure Cow Ghee Drizzle', 'Exotic Saffron Strands', 'Cashew Cream Paste'].map((top) => {
                      const isAdded = activeOrder.items[modifyingItemIdx].addedIngredients.includes(top);
                      return (
                        <button
                          key={top}
                          onClick={() => handleToggleAddition(top)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-display font-semibold border transition-all flex justify-between items-center ${
                            isAdded 
                              ? 'border-emerald-400 bg-emerald-50/20 text-emerald-700' 
                              : 'border-[#ECE7E1] bg-[#FFFDF8] text-neutral-700 hover:bg-white'
                          }`}
                        >
                          <span>{top}</span>
                          <span className="font-mono text-[10px] text-[#6B7280]">₹50</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chef Notes input field */}
                <div>
                  <h5 className="text-[10px] font-mono text-[#6B7280] uppercase font-bold mb-1.5">Chef Instructions</h5>
                  <input
                    type="text"
                    placeholder="e.g. make it non-spicy, cook well..."
                    defaultValue={activeOrder.items[modifyingItemIdx].customInstructions}
                    onBlur={(e) => handleSaveNotes(e.target.value)}
                    className="input-field p-2 text-xs"
                  />
                </div>

                <button
                  onClick={() => setModifyingItemIdx(null)}
                  className="btn-primary w-full py-2.5 text-xs tracking-wider uppercase mt-4"
                >
                  Apply & Recalculate Invoice
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
