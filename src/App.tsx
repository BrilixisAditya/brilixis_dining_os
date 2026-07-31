import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { TableSwitcher } from './components/TableSwitcher';
import { ItemSelectorModal } from './components/ItemSelectorModal';
import { CartDrawer } from './components/CartDrawer';
import { WaiterSummoner } from './components/WaiterSummoner';
import { MobileSidebar } from './components/MobileSidebar';
import { MENU_ITEMS } from './menuData';
import { ShoppingCart, Bell, Sparkles } from 'lucide-react';

// Live role specific terminals
import { RoleLoginScreen } from './components/RoleLoginScreen';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { WaiterTerminal } from './components/WaiterTerminal';
import { KitchenPortal } from './components/KitchenPortal';
import { BillCheckoutProcess } from './components/BillCheckoutProcess';

const MainAppContent: React.FC = () => {
  const {
    tableNumber,
    cart,
    setIsCartOpen,
    waiterRequest,
    triggerCallWaiter,
    activeRole,
    setActiveRole,
  } = useApp();

  const [customizingItemId, setCustomizingItemId] = useState<string | null>(null);

  const selectedItemToCustomize = customizingItemId
    ? MENU_ITEMS.find((item) => item.id === customizingItemId) || null
    : null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartPrice = cart.reduce((acc, item) => {
    const itemExtrasPrice = item.addedIngredients.length * 50; // ₹50 each extra add
    return acc + (item.menuItem.price + itemExtrasPrice) * item.quantity;
  }, 0);

  // Match role portal views
  if (activeRole === 'login') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-8 relative z-10">
          <RoleLoginScreen />
        </main>
      </div>
    );
  }

  if (activeRole === 'owner') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
        <Navbar />
        <main className="max-w-7xl mx-auto py-4">
          <OwnerDashboard />
        </main>
      </div>
    );
  }

  if (activeRole === 'manager') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
        <Navbar />
        <main className="max-w-7xl mx-auto py-4">
          <ManagerDashboard />
        </main>
      </div>
    );
  }

  if (activeRole === 'waiter') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
        <Navbar />
        <main className="max-w-7xl mx-auto py-4">
          <WaiterTerminal />
        </main>
      </div>
    );
  }

  if (activeRole === 'kitchen') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
        <Navbar />
        <main className="max-w-7xl mx-auto py-4">
          <KitchenPortal />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] selection:bg-[#C83214] selection:text-white relative" id="app-layout">
      {/* Premium subtle warm ambient top highlight light tone glow */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#C83214]/5 to-transparent pointer-events-none z-0" />

      {/* Luxury Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="relative max-w-5xl mx-auto px-4 pt-4 pb-28 sm:px-6 z-10" id="main-content">
        {/* Dynamic Welcome & Table Info Bar - Light Luxury style card */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E8E5DD] rounded-[1.5rem] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 shadow-sm"
          id="welcome-coordinate-bar"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#C83214]" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#C83214] font-bold">
                Assigned Table Access
              </span>
            </div>
            <h2 className="text-sm font-display font-medium text-[#1F2226] tracking-tight mt-0.5">
              Welcome to <span className="text-[#C83214] font-bold">Hush Table {tableNumber.toString().padStart(2, '0')}</span> • Session Active
            </h2>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-mono text-[#8C7A6B] font-bold">
              TAP TABLE BADGE FOR QR SIMULATOR
            </span>
          </div>
        </motion.div>

        {/* 1. Signature Dish Hero Spot */}
        <HeroSection onCustomizeItem={setCustomizingItemId} />

        {/* 2. Interactive Menu Listings Grid */}
        <MenuSection onCustomizeItem={setCustomizingItemId} />

        {/* 3. Tableside Active Bill checkout Process center */}
        <BillCheckoutProcess />

        {/* 4. Dedicated Tableside Summon / Callback Panel at the bottom of the page */}
        <section className="mt-14 pt-10 border-t border-[#E8E5DD]" id="summoner-standalone">
          <div className="max-w-xl mx-auto text-center mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C83214] font-bold">
              Immediate Assistance
            </span>
            <h3 className="text-lg font-display font-bold text-[#1F2226] mt-1">
              Need Something Else? Call Waiter Instantly
            </h3>
            <p className="text-xs text-[#5C6168] mt-1 max-w-sm mx-auto">
              Our automated tableside locator page immediately tags your request to Table {tableNumber.toString().padStart(2, '0')} and alerts our nearest host.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <WaiterSummoner />
          </div>
        </section>
      </main>

      {/* 5. FLOATING MOBILE FAST-ACTION BOTTOM BAR (Shows in light premium style when items in cart) */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40"
          id="floating-checkout-nav"
        >
          <div className="bg-white/95 backdrop-blur-lg border border-[#E8E5DD] rounded-2xl p-3 flex justify-between items-center shadow-xl">
            {/* Left cart totals summary */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-11 h-11 rounded-xl bg-[#C83214] flex items-center justify-center text-white font-bold shadow-md shadow-[#C83214]/20 cursor-pointer"
                id="floating-cart-trigger"
              >
                <ShoppingCart size={15} />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#C83214] font-mono font-bold text-[9px] w-4.5 h-4.5 rounded-full border border-[#C83214] flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </button>
              
              <div className="leading-tight">
                <span className="text-[9px] font-mono text-[#8C7A6B] block uppercase font-bold">
                  Cart Subtotal
                </span>
                <span className="text-sm font-mono font-bold text-[#1F2226] block">
                  ₹{cartPrice}
                </span>
              </div>
            </div>

            {/* Right summons and view buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerCallWaiter('general', 'Summon Host')}
                disabled={!!waiterRequest}
                className={`px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                  waiterRequest
                    ? 'bg-[#C83214]/15 text-[#C83214] border-[#C83214]/25'
                    : 'bg-[#FAF9F6] border-[#E8E5DD] text-[#4A4F55] hover:bg-white'
                }`}
                id="floating-summon-btn"
              >
                <Bell size={12} className={waiterRequest ? 'animate-bounce' : ''} />
                Call Table {tableNumber}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-[#C83214] hover:bg-[#D73C1E] text-white px-4 py-2.5 rounded-xl text-[10px] font-display font-medium tracking-wide uppercase transition-all cursor-pointer shadow-sm"
                id="floating-open-cart"
              >
                View Cart
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- FLOATING SHEETS & OVERLAYS --- */}
      
      {/* Swipeable or Three-line action menu sidebar for only mobile users */}
      <MobileSidebar />

      {/* Table scan simulator sheet overlay */}
      <TableSwitcher />

      {/* Customizer Option modifier modal overlay */}
      {selectedItemToCustomize && (
        <ItemSelectorModal
          item={selectedItemToCustomize}
          onClose={() => setCustomizingItemId(null)}
        />
      )}

      {/* Expandable right checkout drawer overlay */}
      <CartDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
