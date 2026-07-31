import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, BellRing, ChevronDown, Menu, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    tableNumber,
    setIsTableSwitcherOpen,
    cart,
    setIsCartOpen,
    waiterRequest,
    triggerCallWaiter,
    setIsMobileSidebarOpen,
    activeRole,
    setActiveRole,
    allOrders,
  } = useApp();

  const activeOrder = allOrders?.find(
    (o) => o.tableNumber === tableNumber && o.status !== 'paid'
  );
  const showPaymentAlert = activeOrder && ['ready', 'served', 'bill_requested'].includes(activeOrder.status);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="nav-bar sm:px-6" id="main-navbar">
      {/* Menu Hamburger Trigger + Brilixis Brand Logo */}
      <div className="flex items-center gap-3" id="navbar-brand-section">
        {/* Modern 3-line Menu Button for Mobile users (Only visible to customers) */}
        {activeRole === 'guest' && (
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="btn-icon bg-white border border-[#ECE7E1] hover:border-[#E76F51] text-[#6B7280] hover:text-[#E76F51] shadow-brilixis-sm p-2.5 rounded-2xl"
            title="Open Navigation Menu"
            id="hamburger-trigger"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="flex items-center gap-2.5" id="navbar-brand">
          <div 
            className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E76F51] to-[#F4A261] flex items-center justify-center font-display font-extrabold text-white text-lg shadow-brilixis-glow select-none" 
          >
            B
          </div>
          <div className="leading-tight select-none">
            <span className="font-display font-extrabold tracking-tight text-[#2D2D2D] text-sm uppercase block">
              Brilixis
            </span>
            <span className="font-mono text-[9px] text-[#E76F51] tracking-wider uppercase block font-bold">
              {activeRole === 'guest' ? 'Dining OS' : `Admin • ${activeRole}`}
            </span>
          </div>
        </div>
      </div>

      {/* Table Selector Trigger (Only visible to customers) */}
      {activeRole === 'guest' && (
        <button
          onClick={() => setIsTableSwitcherOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ECE7E1] hover:border-[#E76F51]/40 transition-all cursor-pointer select-none shadow-brilixis-sm hover:shadow-brilixis-md"
          id="table-badge-trigger"
        >
          <div className={`w-2 h-2 rounded-full ${waiterRequest ? 'bg-[#F4A261] animate-pulse' : 'bg-[#2A9D8F]'}`} />
          <span className="text-xs font-mono font-bold text-[#2D2D2D]">
            Table {tableNumber.toString().padStart(2, '0')}
          </span>
          <ChevronDown size={12} className="text-[#6B7280]" />
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2" id="navbar-actions">
        {/* Admin Exit Button (Only visible in admin/staff portal) */}
        {activeRole !== 'guest' && (
          <button
            onClick={() => setActiveRole('login')}
            className="btn-dark px-3.5 py-2 rounded-2xl"
            title="Exit Admin Portal"
            id="navbar-system-portal-btn"
          >
            <ShieldAlert size={14} className="text-[#E76F51]" />
            <span className="uppercase text-[10px] tracking-wider font-mono font-bold">
              Exit Admin
            </span>
          </button>
        )}

        {/* Quick Summon Waiter Pager (Only in Guest mode) */}
        {activeRole === 'guest' && (
          <button
            onClick={() => triggerCallWaiter('general', 'Tableside Summon')}
            disabled={!!waiterRequest}
            className={`relative p-2.5 rounded-2xl transition-all duration-300 cursor-pointer ${
              waiterRequest
                ? 'bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/20'
                : 'bg-white hover:bg-[#FFFDF8] border border-[#ECE7E1] text-[#6B7280] hover:text-[#E76F51] shadow-brilixis-sm'
            }`}
            title="Summon Waiter"
            id="navbar-summon"
          >
            {waiterRequest && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E76F51] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E76F51]"></span>
              </span>
            )}
            <BellRing size={16} className={waiterRequest ? 'animate-bounce' : ''} />
          </button>
        )}

        {/* Shopping Cart Indicator (Only in Guest mode) */}
        {activeRole === 'guest' && (
          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer ${
              showPaymentAlert 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-brilixis-md hover:bg-emerald-100' 
                : 'bg-white border-[#ECE7E1] text-[#6B7280] hover:text-[#E76F51] hover:border-[#E76F51]/30 shadow-brilixis-sm'
            }`}
            id="navbar-cart"
          >
            <ShoppingCart size={17} />
            {cartCount > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartCount}
                className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-[#E76F51] text-[10px] font-mono font-bold text-white shadow-brilixis-glow"
                id="cart-count-badge"
              >
                {cartCount}
              </motion.span>
            ) : showPaymentAlert ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2A9D8F] text-[10px] font-bold text-white shadow-brilixis-teal font-sans"
                id="cart-payment-alert-badge"
                title="Bill is served. Click here to Settle Pay!"
              >
                ₹
              </motion.span>
            ) : null}
          </button>
        )}
      </div>
    </nav>
  );
};
