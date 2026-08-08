import React from 'react';
import { Sparkles, Plus, SlidersHorizontal, Clock } from 'lucide-react';

interface HeroSectionProps {
  onCustomizeItem: (itemId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCustomizeItem }) => {

  
  // Find signature dish (Gold Leaf Saffron Paneer Tikka or first item)
  // const signatureItem = menuItems.find(item => item.isSignature) || menuItems[0];
  const signatureItem = {
    id: 'wuwi220',
    name: '',
    description: '',
    tags: [],
    price: 2000,
    isVeg: false
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // addToCart(signatureItem, 1, [], [], '');
  };

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden bg-white border border-[#ECE7E1] mt-4 mb-8 shadow-brilixis-md transition-all duration-300" id="hero-section">
      {/* Signature Food Image Container */}
      <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-[#FFFDF8]">
        <img
          src={''}
          alt={''}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-700 ease-out"
          id="hero-image"
        />
        
        {/* Subtle Gradient Overlay for text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/50 to-transparent z-10" />
        
        {/* Signature Gold/Coral Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] shadow-brilixis-sm">
          <Sparkles size={12} className="text-[#E76F51] fill-[#E76F51] animate-pulse" />
          <span className="text-[10px] uppercase font-display font-extrabold tracking-wider text-[#E76F51]">
            Chef's Masterpiece
          </span>
        </div>

        {/* Veg / Non-Veg & Prep Time Pills */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {signatureItem?.isVeg !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] text-[10px] font-mono font-bold shadow-brilixis-sm">
              <span className={`w-2 h-2 rounded-full ${signatureItem?.isVeg ? 'bg-[#2A9D8F]' : 'bg-[#EB5757]'}`} />
              <span className={signatureItem?.isVeg ? 'text-[#2A9D8F]' : 'text-[#EB5757]'}>
                {signatureItem?.isVeg ? 'Veg' : 'Non-Veg'}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] text-[10px] font-mono font-bold text-[#6B7280] shadow-brilixis-sm">
            <Clock size={11} className="text-[#F4A261]" />
            <span>18 min</span>
          </div>
        </div>
      </div>

      {/* Hero Content Area */}
      <div className="relative p-6 sm:p-8 pt-0 z-20 -mt-2 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#E76F51] font-extrabold">
            Featured Culinary Creation
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-display font-black text-[#2D2D2D] tracking-tight leading-tight mb-2">
          {signatureItem.name}
        </h1>
        
        <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-5 max-w-2xl">
          {signatureItem.description}
        </p>

        {/* Nutritional & Tags & Price */}
        <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-[#ECE7E1] gap-3">
          <div className="flex flex-wrap gap-2">
            {signatureItem.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-bold font-mono px-3 py-1 rounded-xl bg-[#FFFDF8] text-[#6B7280] border border-[#ECE7E1]">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-baseline gap-1" id="hero-price">
            <span className="text-sm font-mono text-[#E76F51] font-bold">₹</span>
            <span className="text-2xl sm:text-3xl font-display font-black text-[#2D2D2D]">
              {signatureItem.price}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleQuickAdd}
            className="btn-primary flex-1 py-3.5 px-6 uppercase text-xs tracking-wider"
            id="hero-quick-add"
          >
            <Plus size={16} />
            Add to Order
          </button>
          
          <button
            onClick={() => onCustomizeItem(signatureItem.id)}
            className="btn-icon p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#ECE7E1] hover:border-[#E76F51]"
            title="Customize Dish & Ingredients"
            id="hero-customize"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
