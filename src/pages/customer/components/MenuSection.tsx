import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Plus, LayoutGrid, Leaf, ChevronRight } from 'lucide-react';
import { MenuItem } from '../../../types/menuData';

interface MenuSectionProps {
  menuItems: MenuItem[];
  onCustomizeItem: (itemId: string) => void;
  activeCategory: string;
  setActiveCategory: (value: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  onCustomizeItem,
  activeCategory,
  setActiveCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');

  // Categories are derived from the API response, so a restaurant can add a
  // category without requiring a frontend deployment.
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(menuItems.map((item) => item.category).filter(Boolean)),
    );

    return unique.map((id) => ({
      id,
      label: id.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    }));
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory = !activeCategory || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query));
      const matchesDiet =
        dietFilter === 'all' ||
        (dietFilter === 'veg' && item.isVeg) ||
        (dietFilter === 'nonveg' && !item.isVeg);

      return matchesCategory && matchesSearch && matchesDiet;
    });
  }, [menuItems, activeCategory, searchQuery, dietFilter]);

  // When the API returns a new menu/category list, avoid keeping a category
  // selected that no longer exists.
  React.useEffect(() => {
    if (categories.length > 0 && !categories.some((category) => category.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory, setActiveCategory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start" id="menu-section-container">
      <aside className="md:col-span-1 md:sticky md:top-20 space-y-6" id="menu-sidebar">
        <div className="card-surface p-5">
          <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-4 px-1 flex items-center justify-between font-mono">
            <span>Menu Chapters</span>
            <span className="text-[10px] text-[#E76F51] bg-[#FFFDF8] px-2 py-0.5 rounded-full border border-[#ECE7E1]">
              {categories.length} Categories
            </span>
          </h3>

          <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {categories.map((category) => {
              const isActive = category.id === activeCategory;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-display font-medium cursor-pointer transition-all duration-200 w-full text-left whitespace-nowrap border ${
                    isActive
                      ? 'bg-[#E76F51] text-white border-transparent font-bold shadow-brilixis-glow'
                      : 'bg-[#FFFDF8] border-[#ECE7E1] text-[#2D2D2D] hover:text-[#E76F51] hover:border-[#E76F51]/30 hover:bg-white'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${isActive ? 'text-white' : 'text-[#E76F51]'}`}>•</span>
                  <span className="flex-1 text-xs tracking-tight font-extrabold">{category.label}</span>
                  <ChevronRight size={14} className={`hidden md:block transition-transform ${isActive ? 'translate-x-1 text-white' : 'opacity-40 text-[#6B7280]'}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-surface p-5 hidden md:block">
          <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-3 font-mono">
            Dietary Selection
          </h3>
          <DietFilter value={dietFilter} onChange={setDietFilter} />
        </div>
      </aside>

      <section className="md:col-span-3 space-y-6" id="product-listing">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between" id="filter-controls-bar">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="input-field pl-10 pr-4 py-3 shadow-brilixis-sm font-display"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-[#ECE7E1] rounded-2xl p-1.5 w-full sm:w-auto shadow-brilixis-sm">
            <DietFilter value={dietFilter} onChange={setDietFilter} compact />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="h-64 rounded-[2rem] border border-dashed border-[#ECE7E1] bg-white flex flex-col items-center justify-center text-center p-6 shadow-brilixis-sm">
            <p className="text-xs text-[#6B7280] max-w-xs leading-relaxed font-medium">
              No menu items matched your current filters. Try another category, search term, or dietary filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="products-grid">
            {filteredItems.map((item) => {
              const isSoldOut = item.isOutOfStock;
              return (
                <motion.div
                  layout
                  key={item.id}
                  className={`menu-card p-5 ${isSoldOut ? 'opacity-60 grayscale-[30%] shadow-none' : ''}`}
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#FFFDF8] border border-[#ECE7E1]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#8C7A6B]">No image</div>
                      )}

                      <div className="absolute top-3 right-3 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#ECE7E1] z-10 flex items-center justify-center shadow-brilixis-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-[#2A9D8F]' : 'bg-[#EB5757]'}`} />
                      </div>

                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3.5 py-1.5 rounded-xl bg-white text-[#2D2D2D] font-display font-black text-[10px] tracking-widest uppercase border border-[#ECE7E1]">
                            Unavailable
                          </span>
                        </div>
                      )}

                      {item.isSignature && !isSoldOut && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1 rounded-xl bg-[#E76F51] text-white font-mono text-[9px] tracking-wider font-extrabold shadow-brilixis-glow">
                          <Sparkles size={10} className="fill-white" /> CHEF'S CHOICE
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 mb-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-[#2A9D8F]' : 'bg-[#EB5757]'}`} />
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#6B7280]">
                          {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        </span>
                      </div>
                      <h4 className="text-base font-display font-extrabold text-[#2D2D2D] tracking-tight leading-snug">{item.name}</h4>
                      <p className="text-xs text-[#6B7280] line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    {item.ingredients.length > 0 && (
                      <div className="border-t border-[#ECE7E1] pt-3 text-[10px] font-mono text-[#6B7280] leading-tight">
                        <span className="text-[#2D2D2D] font-bold uppercase">Includes: </span>
                        {item.ingredients.slice(0, 3).join(', ')}{item.ingredients.length > 3 ? '...' : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#ECE7E1]">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-mono text-[#E76F51] font-bold">₹</span>
                      <span className="text-xl font-display font-black text-[#2D2D2D]">{item.price}</span>
                    </div>

                    {isSoldOut ? (
                      <button disabled className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 font-display font-bold text-xs cursor-not-allowed">
                        Unavailable
                      </button>
                    ) : (
                      <button onClick={() => onCustomizeItem(item.id)} className="btn-outline px-4 py-2.5 rounded-2xl hover:bg-[#E76F51] hover:text-white hover:border-[#E76F51] text-xs font-display flex items-center gap-1.5">
                        <Plus size={14} className="text-[#E76F51]" /> Add Dish
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

function DietFilter({
  value,
  onChange,
  compact = false,
}: {
  value: 'all' | 'veg' | 'nonveg';
  onChange: (value: 'all' | 'veg' | 'nonveg') => void;
  compact?: boolean;
}) {
  return (
    <>
      {(['all', 'veg', 'nonveg'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`${compact ? 'flex-1 sm:flex-none px-4' : 'px-2'} flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] uppercase font-mono font-bold tracking-wider transition-all cursor-pointer ${value === mode ? 'bg-[#E76F51] text-white shadow-brilixis-sm' : 'text-[#6B7280] hover:text-[#2D2D2D]'}`}
        >
          {mode === 'veg' && <Leaf size={10} />}
          {mode === 'all' && <LayoutGrid size={10} />}
          {mode === 'veg' ? 'Veg Only' : mode === 'nonveg' ? 'Non-Veg' : 'All Items'}
        </button>
      ))}
    </>
  );
}
