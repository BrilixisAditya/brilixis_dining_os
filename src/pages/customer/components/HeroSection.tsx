import React from 'react';
import { Sparkles, SlidersHorizontal, Clock } from 'lucide-react';
import { MenuItem } from '../../../types/menuData';

interface HeroSectionProps {
  item: MenuItem | null;
  onCustomizeItem: (itemId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ item, onCustomizeItem }) => {
  if (!item) return null;

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden bg-white border border-[#ECE7E1] mt-4 mb-8 shadow-brilixis-md" id="hero-section">
      <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-[#FFFDF8]">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-[#8C7A6B]">Featured dish</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/50 to-transparent z-10" />

        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] shadow-brilixis-sm">
          <Sparkles size={12} className="text-[#E76F51] fill-[#E76F51]" />
          <span className="text-[10px] uppercase font-display font-extrabold tracking-wider text-[#E76F51]">Chef's Masterpiece</span>
        </div>

        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] text-[10px] font-mono font-bold shadow-brilixis-sm">
            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-[#2A9D8F]' : 'bg-[#EB5757]'}`} />
            <span className={item.isVeg ? 'text-[#2A9D8F]' : 'text-[#EB5757]'}>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] text-[10px] font-mono font-bold text-[#6B7280] shadow-brilixis-sm">
            <Clock size={11} className="text-[#F4A261]" /> <span>Featured</span>
          </div>
        </div>
      </div>

      <div className="relative p-6 sm:p-8 pt-0 z-20 -mt-2 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#E76F51] font-extrabold">Featured Culinary Creation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-[#2D2D2D] tracking-tight leading-tight mb-2">{item.name}</h1>
        <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-5 max-w-2xl">{item.description}</p>

        <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-[#ECE7E1] gap-3">
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] font-bold font-mono px-3 py-1 rounded-xl bg-[#FFFDF8] text-[#6B7280] border border-[#ECE7E1]">{tag}</span>
            ))}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-mono text-[#E76F51] font-bold">₹</span>
            <span className="text-2xl sm:text-3xl font-display font-black text-[#2D2D2D]">{item.price}</span>
          </div>
        </div>

        <button onClick={() => onCustomizeItem(item.id)} className="btn-primary w-full py-3.5 px-6 uppercase text-xs tracking-wider flex items-center justify-center gap-2">
          <SlidersHorizontal size={16} /> Customize & Add to Order
        </button>
      </div>
    </div>
  );
};
