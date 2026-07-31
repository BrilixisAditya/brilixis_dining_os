import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TableSwitcher: React.FC = () => {
  const { isTableSwitcherOpen, setIsTableSwitcherOpen, tableNumber, setTableNumber, restaurantTables } = useApp();

  const handleSelectTable = (num: number) => {
    setTableNumber(num);
    setIsTableSwitcherOpen(false);
  };

  return (
    <AnimatePresence>
      {isTableSwitcherOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTableSwitcherOpen(false)}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
            id="table-switcher-backdrop"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#FFFDF8] border-t border-[#ECE7E1] rounded-t-[2.5rem] p-6 pb-12 z-50 shadow-brilixis-lg overflow-hidden text-[#2D2D2D]"
            id="table-switcher-drawer"
          >
            {/* Visual indicator drag bar */}
            <div className="w-12 h-1 bg-[#ECE7E1] rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-display font-extrabold tracking-tight text-[#2D2D2D]">
                  Table Simulator
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Simulating QR code scan for Tables 1-10
                </p>
              </div>
              <button
                onClick={() => setIsTableSwitcherOpen(false)}
                className="btn-icon p-2 rounded-full"
                id="close-table-switcher"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto p-1" id="table-grid">
              {restaurantTables.map((tbl) => {
                const isActive = tbl.number === tableNumber;
                return (
                  <button
                    key={tbl.id}
                    onClick={() => handleSelectTable(tbl.number)}
                    className={`relative p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E76F51] text-white shadow-brilixis-glow font-bold scale-102 border-transparent cursor-default'
                        : tbl.status === 'disabled'
                        ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
                        : 'bg-white border border-[#ECE7E1] text-[#2D2D2D] hover:border-[#E76F51]/40 cursor-pointer shadow-brilixis-sm'
                    }`}
                    id={`table-option-${tbl.number}`}
                  >
                    <span className={`text-[9px] font-mono leading-none ${isActive ? 'text-white/80' : 'text-[#6B7280]'} block`}>
                      TBL
                    </span>
                    <span className="text-base font-display tracking-tight leading-none mt-1 font-bold">
                      {tbl.number.toString().padStart(2, '0')}
                    </span>
                    <span className={`text-[8px] font-mono leading-none mt-1 truncate ${isActive ? 'text-white/90' : 'text-[#8C7A6B]'}`}>
                      {tbl.capacity} Pax
                    </span>
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-white text-[#E76F51] scale-90">
                        <Check size={8} strokeWidth={4} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 bg-white border border-[#ECE7E1] rounded-2xl p-4 flex items-start gap-3 shadow-brilixis-sm">
              <span className="p-2 py-1 rounded bg-[#E76F51]/10 text-[#E76F51] mt-0.5 font-mono text-[9px] font-bold tracking-wider uppercase block">
                INFO
              </span>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Scanning a physical QR code automatically assigns guests to their corresponding table number. Orders and requests are synchronized instantly.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
