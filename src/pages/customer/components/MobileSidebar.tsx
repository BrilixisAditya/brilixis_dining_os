import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Utensils,
  Flame,
  CupSoda,
  Cherry,
  Check,
  Info,
} from "lucide-react";
import { CATEGORIES } from "../../../types/menuData";

interface MobileSidebarProps {
  tableNumber: string;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (val: boolean) => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  tableNumber,
  activeCategory,
  setActiveCategory,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setIsMobileSidebarOpen(false);
  };

  const renderCategoryIcon = (iconStr: string, active: boolean) => {
    const defaultClass = active ? "text-[#E76F51]" : "text-[#6B7280]";
    switch (iconStr) {
      case "Sparkles":
        return <Sparkles size={18} className={defaultClass} />;
      case "Utensils":
        return <Utensils size={18} className={defaultClass} />;
      case "Flame":
        return <Flame size={18} className={defaultClass} />;
      case "CupSoda":
        return <CupSoda size={18} className={defaultClass} />;
      case "Cherry":
        return <Cherry size={18} className={defaultClass} />;
      default:
        return <Sparkles size={18} className={defaultClass} />;
    }
  };

  return (
    <AnimatePresence>
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex" id="mobile-sidebar-root">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            id="mobile-sidebar-backdrop"
          />

          {/* Swipeable Drawer sheet */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative w-80 max-w-[85vw] bg-[#FFFDF8] h-full flex flex-col shadow-brilixis-lg p-6 z-55 border-r border-[#ECE7E1]"
            id="mobile-sidebar-panel"
          >
            {/* Top Close Row */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#ECE7E1]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#E76F51] font-bold">
                  Brilixis
                </span>
                <h3 className="text-lg font-display font-bold text-[#2D2D2D] leading-tight">
                  Menu Categories
                </h3>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="btn-icon p-2 rounded-full bg-white border border-[#ECE7E1]"
                id="close-mobile-menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu options list */}
            <div className="flex-1 space-y-3" id="mobile-chapters-list">
              {CATEGORIES.map((cat) => {
                const isActive = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/30 shadow-brilixis-sm font-bold"
                        : "bg-white text-[#2D2D2D] border-[#ECE7E1] hover:bg-[#FFFDF8]"
                    }`}
                    id={`mobile-cat-option-${cat.id}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl border transition-colors ${
                          isActive
                            ? "bg-white border-[#E76F51]/30"
                            : "bg-[#FFFDF8] border-[#ECE7E1]"
                        }`}
                      >
                        {renderCategoryIcon(cat.icon, isActive)}
                      </div>
                      <div className="leading-tight">
                        <span className="text-[#E76F51] text-[9px] font-mono tracking-widest block uppercase font-bold">
                          Category
                        </span>
                        <h4
                          className={`text-sm font-display tracking-tight mt-0.5 ${isActive ? "font-bold text-[#2D2D2D]" : "font-medium"}`}
                        >
                          {cat.label}
                        </h4>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-[#E76F51] text-white flex items-center justify-center scale-90">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Brand / QR info signature card */}
            <div className="mt-auto card-surface p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D2D2D] font-display">
                <Info size={14} className="text-[#E76F51]" />
                <span>
                  Table {tableNumber.toString().padStart(2, "0")} Session
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Browse our menu, customize ingredients, and place your order or
                call your table steward whenever needed.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
