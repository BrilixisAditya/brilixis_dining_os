import React, { Dispatch, SetStateAction } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, BellRing, ChevronDown, Menu, ShieldAlert} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { triggerCallWaiter } from '@/src/services/waiter_request.service';
import { WaiterRequest } from '@/src/types/types';



interface NavbarProps {

  tableNumber?: number;

  cartCount?: number;

  waiterRequest?: boolean;

  showPaymentAlert?: boolean;

  onOpenCart?: () => void;

  onOpenSidebar?: () => void;

  onOpenTableSwitcher?: () => void;

  onCallWaiter?: Dispatch<SetStateAction<WaiterRequest[]>>;

  onExitAdmin?: () => void;
}



const Navbar: React.FC<NavbarProps> = ({

  tableNumber,

  cartCount = 0,

  waiterRequest = false,

  showPaymentAlert = false,

  onOpenCart,

  onOpenSidebar,

  onOpenTableSwitcher,

  onCallWaiter,

  onExitAdmin,
}) => {


  const location = useLocation();
  const navigate = useNavigate();

  // 2. Helper flags based on current route
  const isCustomerPage = !location.pathname.startsWith('/auth') && 
                         !location.pathname.startsWith('/staff') && 
                         !location.pathname.startsWith('/admin') &&
                         !location.pathname.startsWith('/terminal');
  
  const isStaffPage = location.pathname.startsWith('/staff');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthOrTerminalPage = location.pathname.startsWith('/auth') || location.pathname.startsWith('/terminal');

  

  return (
    <nav className="nav-bar sm:px-6" id="main-navbar">
      {/* Menu Hamburger Trigger + Brilixis Brand Logo */}
      <div className="flex items-center gap-3" id="navbar-brand-section">
        {/* Modern 3-line Menu Button for Mobile users (Only visible to customers) */}
        {isCustomerPage && (
          <button
            onClick={onOpenSidebar}
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
              {isCustomerPage ? 'Dining OS' : isStaffPage ? 'Staff Portal' : isAdminPage ? 'Admin Portal' : 'Terminal'}
            </span>
          </div>
        </div>
      </div>

      {/* Table Selector Trigger (Only visible to customers) */}
      {isCustomerPage && (
        <button
          onClick={onOpenTableSwitcher}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ECE7E1] hover:border-[#E76F51]/40 transition-all cursor-pointer select-none shadow-brilixis-sm hover:shadow-brilixis-md"
          id="table-badge-trigger"
        >
          <div className={`w-2 h-2 rounded-full ${waiterRequest ? 'bg-[#F4A261] animate-pulse' : 'bg-[#2A9D8F]'}`} />
          <span className="text-xs font-mono font-bold text-[#2D2D2D]">
            Table {(tableNumber ?? 0)?.toString().padStart(2, '0')}
          </span>
          <ChevronDown size={12} className="text-[#6B7280]" />
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2" id="navbar-actions">
        {/* Role Terminal Exit Button */}
        {(isAdminPage || isStaffPage) && (
          <button
            onClick={() => navigate('/auth/login')}
            className="btn-dark px-3.5 py-2 rounded-2xl cursor-pointer"
            title="Exit to Staff Terminal Hub"
            id="navbar-system-portal-btn"
          >
            <ShieldAlert size={14} className="text-[#E76F51]" />
            <span className="uppercase text-[10px] tracking-wider font-mono font-bold">
              Exit Terminal
            </span>
          </button>
        )}

        {/* Public Login or Terminal Hub back to Guest Customer Menu */}
        {isAuthOrTerminalPage && (
          <button
            onClick={() => navigate('/customer')}
            className="px-3 py-2 rounded-2xl bg-white border border-[#ECE7E1] hover:border-[#E76F51] text-[#2D2D2D] hover:text-[#E76F51] text-xs font-mono font-bold cursor-pointer transition-colors shadow-xs"
            title="Return to Customer Dining Menu"
          >
            Customer Menu
          </button>
        )}

        {/* Quick Summon Waiter Pager (Only in Guest mode) */}
        {isCustomerPage && (
          <button
            onClick={() => triggerCallWaiter('general', 'Tableside Summon', tableNumber ?? 0, onCallWaiter!)}
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
        {isCustomerPage && (
          <button
            onClick={onOpenCart}
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


export default Navbar;

