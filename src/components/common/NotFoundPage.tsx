import React from 'react';
import { motion } from 'motion/react';
import {
  UtensilsCrossed,
  Home,
  ArrowLeft,
  Search,
  Compass,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  QrCode,
  BellRing
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export interface NotFoundPageProps {
  onGoHome?: () => void;
  onGoTerminal?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onGoHome,
  onGoTerminal,
}) => {
  let navigate: ((path: string) => void) | null = null;
  let locationPath = '';

  try {
    // Attempt react-router-dom navigation if within a BrowserRouter
    const routerNavigate = useNavigate();
    const location = useLocation();
    navigate = routerNavigate;
    locationPath = location.pathname;
  } catch (err) {
    // Fallback if rendered outside of Router context
    navigate = null;
  }

  const handleNavigateHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  };

  const handleNavigateTerminal = () => {
    if (onGoTerminal) {
      onGoTerminal();
    } else if (navigate) {
      navigate('/auth/terminal');
    } else {
      window.location.href = '/auth/terminal';
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleNavigateHome();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D] flex flex-col justify-between relative overflow-hidden selection:bg-[#E76F51] selection:text-white">
      {/* Warm Ambient Glow Highlights */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#E76F51]/10 via-[#F4A261]/5 to-transparent pointer-events-none z-0" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#E76F51]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#2A9D8F]/5 blur-3xl pointer-events-none" />

      {/* Mini Brand Header */}
      <header className="relative z-10 px-6 py-5 max-w-5xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleNavigateHome}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E76F51] to-[#F4A261] flex items-center justify-center font-display font-extrabold text-white text-lg shadow-md select-none">
            B
          </div>
          <div className="leading-tight select-none">
            <span className="font-display font-extrabold tracking-tight text-[#2D2D2D] text-sm uppercase block">
              Brilixis
            </span>
            <span className="font-mono text-[9px] text-[#E76F51] tracking-wider uppercase block font-bold">
              Dining OS
            </span>
          </div>
        </div>

        <button
          onClick={handleGoBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#ECE7E1] hover:border-[#E76F51] text-[#2D2D2D] hover:text-[#E76F51] text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          id="notfound-goback-btn"
        >
          <ArrowLeft size={14} />
          <span>Go Back</span>
        </button>
      </header>

      {/* Main 404 Hero Content */}
      <main className="relative z-10 max-w-xl mx-auto px-4 py-8 text-center flex-1 flex flex-col justify-center items-center">
        {/* Animated Badge & Graphic Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="relative inline-block mb-6">
            {/* Big 404 Graphic Card */}
            <div className="bg-white border border-[#ECE7E1] rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E76F51] via-[#F4A261] to-[#2A9D8F]" />
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-6xl sm:text-7xl font-display font-black text-[#2D2D2D] tracking-tighter">
                  4
                </span>
                
                {/* Center Spinning Plate / Utensils Icon */}
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E76F51]/10 border-2 border-dashed border-[#E76F51]/30 flex items-center justify-center text-[#E76F51] my-1 shadow-inner"
                >
                  <UtensilsCrossed size={32} className="sm:hidden" />
                  <UtensilsCrossed size={40} className="hidden sm:block" />
                </motion.div>

                <span className="text-6xl sm:text-7xl font-display font-black text-[#2D2D2D] tracking-tighter">
                  4
                </span>
              </div>

              {/* Status Code Chip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#ECE7E1] text-[10px] font-mono font-bold text-[#E76F51] uppercase tracking-wider mt-2">
                <Compass size={12} className="animate-spin" />
                <span>Recipe Not Found • Off-Menu Route</span>
              </div>
            </div>
          </div>

          {/* Heading & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#2D2D2D] tracking-tight">
              Looks like this table is reserved or missing!
            </h1>
            <p className="text-sm text-[#6B7280] mt-2 max-w-md mx-auto leading-relaxed">
              The page or resource you are looking for ({locationPath || 'unknown endpoint'}) doesn&apos;t exist or has been relocated in the dining layout.
            </p>
          </motion.div>

          {/* Action Navigation Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left w-full"
          >
            {/* Action 1: Return to Customer Menu */}
            <button
              onClick={handleNavigateHome}
              className="group bg-white border border-[#ECE7E1] hover:border-[#E76F51] p-4 rounded-2xl text-left transition-all cursor-pointer shadow-xs hover:shadow-md flex items-start gap-3.5"
              id="notfound-customer-menu-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center shrink-0 group-hover:bg-[#E76F51] group-hover:text-white transition-colors">
                <Home size={18} />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-[#2D2D2D] group-hover:text-[#E76F51] transition-colors block">
                  Customer Dining Menu
                </span>
                <span className="text-[11px] text-[#6B7280] block mt-0.5 leading-snug">
                  Browse dishes, select table, or order food.
                </span>
              </div>
            </button>

            {/* Action 2: Staff Terminal Hub */}
            <button
              onClick={handleNavigateTerminal}
              className="group bg-white border border-[#ECE7E1] hover:border-[#2A9D8F] p-4 rounded-2xl text-left transition-all cursor-pointer shadow-xs hover:shadow-md flex items-start gap-3.5"
              id="notfound-terminal-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2A9D8F]/10 text-[#2A9D8F] flex items-center justify-center shrink-0 group-hover:bg-[#2A9D8F] group-hover:text-white transition-colors">
                <ShieldAlert size={18} />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-[#2D2D2D] group-hover:text-[#2A9D8F] transition-colors block">
                  Staff & Admin Terminal
                </span>
                <span className="text-[11px] text-[#6B7280] block mt-0.5 leading-snug">
                  Access Manager, Waiter, or Kitchen portals.
                </span>
              </div>
            </button>
          </motion.div>

          {/* Primary Big CTA Button */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={handleNavigateHome}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-[#E76F51] hover:bg-[#D65D3F] text-white font-display font-bold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
              id="notfound-primary-home-btn"
            >
              <Home size={16} />
              <span>Return to Main Menu</span>
            </button>

            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3 bg-white border border-[#ECE7E1] hover:border-[#2D2D2D] text-[#2D2D2D] font-display font-bold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              id="notfound-secondary-back-btn"
            >
              <ArrowLeft size={16} />
              <span>Back to Previous Page</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 py-6 text-center text-xs text-[#6B7280] font-mono border-t border-[#ECE7E1]/60 max-w-5xl mx-auto w-full px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#E76F51]" />
            <span>Brilixis Dining OS • Smart Tableside Platform</span>
          </div>
          <div>
            Need help? Contact restaurant staff or table attendant.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;
