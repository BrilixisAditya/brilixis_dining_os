import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Plus, LayoutGrid, Leaf, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../../types/menuData';

interface MenuSectionProps {
  onCustomizeItem: (itemId: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onCustomizeItem, activeCategory, setActiveCategory }) => {

  // const {menuItems } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');

  // Filter Items
  // const filteredItems = [].filter((item) => {
  //   const matchesCategory = item.category === activeCategory;
  //   const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //                         item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    
  //   const matchesDiet = 
  //     dietFilter === 'all' || 
  //     (dietFilter === 'veg' && item.isVeg) || 
  //     (dietFilter === 'nonveg' && !item.isVeg);

  //   return matchesCategory && matchesSearch && matchesDiet;
  // });

  const filteredItems:any = [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start" id="menu-section-container">
      {/* 1. LEFT SIDEBAR (Visible & sticky on desktop) */}
      <aside className="md:col-span-1 md:sticky md:top-20 space-y-6" id="menu-sidebar">
        {/* Category List Drawer Inside Sidebar */}
        <div className="card-surface p-5">
          <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-4 px-1 flex items-center justify-between font-mono">
            <span>Menu Chapters</span>
            <span className="text-[10px] text-[#E76F51] bg-[#FFFDF8] px-2 py-0.5 rounded-full border border-[#ECE7E1]">
              {CATEGORIES.length} Categories
            </span>
          </h3>
          
          <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0" id="category-sidebar-list">
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-display font-medium cursor-pointer transition-all duration-200 w-full text-left whitespace-nowrap md:whitespace-normal border ${
                    isActive
                      ? 'bg-[#E76F51] text-white border-transparent font-bold shadow-brilixis-glow'
                      : 'bg-[#FFFDF8] border-[#ECE7E1] text-[#2D2D2D] hover:text-[#E76F51] hover:border-[#E76F51]/30 hover:bg-white'
                  }`}
                  id={`cat-btn-${cat.id}`}
                >
                  <span className={`text-xs font-mono font-bold uppercase ${isActive ? 'text-white' : 'text-[#E76F51]'}`}>
                    •
                  </span>
                  <span className="flex-1 text-xs tracking-tight font-extrabold">{cat.label}</span>
                  <ChevronRight size={14} className={`hidden md:block transition-transform ${isActive ? 'translate-x-1 text-white' : 'opacity-40 text-[#6B7280]'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary preferences block for Desktop users */}
        <div className="card-surface p-5 hidden md:block">
          <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-3 font-mono">
            Dietary Selection
          </h3>
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#FFFDF8] rounded-2xl border border-[#ECE7E1]">
            {(['all', 'veg', 'nonveg'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDietFilter(mode)}
                className={`text-[10px] uppercase font-mono py-2 rounded-xl font-bold cursor-pointer transition-all text-center ${
                  dietFilter === mode
                    ? 'bg-[#E76F51] text-white shadow-brilixis-sm'
                    : 'text-[#6B7280] hover:text-[#2D2D2D]'
                }`}
              >
                {mode === 'veg' ? 'Veg' : mode === 'nonveg' ? 'Non-Veg' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. MENU PRODUCT GRID & CONTROLS */}
      <section className="md:col-span-3 space-y-6" id="product-listing">
        {/* Interactive Filters (Search and quick mobile selectors) */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between" id="filter-controls-bar">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 pr-4 py-3 shadow-brilixis-sm font-display"
              id="search-input"
            />
          </div>

          {/* Quick Dietary Selector for Mobile screen */}
          <div className="flex items-center gap-1 bg-white border border-[#ECE7E1] rounded-2xl p-1.5 w-full sm:w-auto shadow-brilixis-sm" id="mobile-dietary-selector">
            {(['all', 'veg', 'nonveg'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDietFilter(mode)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] uppercase font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  dietFilter === mode
                    ? 'bg-[#E76F51] text-white shadow-brilixis-sm'
                    : 'text-[#6B7280] hover:text-[#2D2D2D]'
                }`}
              >
                {mode === 'veg' && <Leaf size={10} className="text-emerald-400" />}
                {mode === 'all' && <LayoutGrid size={10} />}
                {mode === 'veg' ? 'Veg Only' : mode === 'nonveg' ? 'Non-Veg' : 'All Items'}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid with INR currency */}
        {filteredItems.length === 0 ? (
          <div className="h-64 rounded-[2rem] border border-dashed border-[#ECE7E1] bg-white flex flex-col items-center justify-center text-center p-6 shadow-brilixis-sm" id="no-products-view">
            <p className="text-xs text-[#6B7280] max-w-xs leading-relaxed font-medium">
              No menu items matched your search. Try resetting your query or dietary filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="products-grid">
            {filteredItems.map((item:any) => {
              const isSoldOut = item.isOutOfStock;
              return (
                <motion.div
                  layout
                  key={item.id}
                  className={`menu-card p-5 ${
                    isSoldOut 
                      ? 'opacity-60 grayscale-[30%] shadow-none' 
                      : ''
                  }`}
                  id={`product-card-${item.id}`}
                >
                  <div className="space-y-4">
                    {/* Item Thumbnail */}
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#FFFDF8] border border-[#ECE7E1]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 font-sans"
                      />
                      
                      {/* Dietary Type Dot */}
                      <div className="absolute top-3 right-3 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] z-10 flex items-center justify-center shadow-brilixis-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-[#2A9D8F]' : 'bg-[#EB5757]'}`} />
                      </div>

                      {/* Sold Out Badge overlay */}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3.5 py-1.5 rounded-xl bg-white text-[#2D2D2D] font-display font-black text-[10px] tracking-widest uppercase border border-[#ECE7E1]">
                            Sold Out
                          </span>
                        </div>
                      )}

                      {/* Signature / Popular badge */}
                      {item.isSignature && !isSoldOut && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1 rounded-xl bg-[#E76F51] text-white font-mono text-[9px] tracking-wider font-extrabold shadow-brilixis-glow">
                          <Sparkles size={10} className="fill-white" />
                          CHEF'S CHOICE
                        </div>
                      )}
                    </div>

                    {/* Content text */}
                    <div>
                      <div className="inline-flex items-center gap-1.5 mb-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-[#2A9D8F]' : 'bg-[#EB5757]'}`} />
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#6B7280]">
                          {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-display font-extrabold text-[#2D2D2D] tracking-tight group-hover:text-[#E76F51] transition-colors leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#6B7280] line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Mini ingredient tags */}
                    <div className="border-t border-[#ECE7E1] pt-3 text-[10px] font-mono text-[#6B7280] flex flex-wrap gap-1 leading-tight">
                      <span className="text-[#2D2D2D] font-bold uppercase">Includes:</span>
                      {item.ingredients.slice(0, 3).join(', ')}
                      {item.ingredients.length > 3 && '...'}
                    </div>
                  </div>

                  {/* Pricing and Action trigger in Indian Rupees */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#ECE7E1]">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-mono text-[#E76F51] font-bold">₹</span>
                      <span className="text-xl font-display font-black text-[#2D2D2D]">
                        {item.price}
                      </span>
                    </div>

                    {/* Add to order button */}
                    {isSoldOut ? (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 font-display font-bold text-xs flex items-center gap-1.5 cursor-not-allowed"
                      >
                        Unavailable
                      </button>
                    ) : (
                      <button
                        onClick={() => onCustomizeItem(item.id)}
                        className="btn-outline px-4 py-2.5 rounded-2xl hover:bg-[#E76F51] hover:text-white hover:border-[#E76F51] text-xs font-display flex items-center gap-1.5"
                        id={`add-btn-${item.id}`}
                      >
                        <Plus size={14} className="text-[#E76F51] group-hover:text-white transition-colors" />
                        Add Dish
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
