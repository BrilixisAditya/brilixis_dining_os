import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../menuData';

interface ItemSelectorModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({ item, onClose }) => {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState<number>(1);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [addedIngredients, setAddedIngredients] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Reset defaults on opening different item
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setExcludedIngredients([]);
      setAddedIngredients([]);
      setCustomInstructions('');
    }
  }, [item]);

  if (!item) return null;

  const handleToggleExclude = (ingredient: string) => {
    setExcludedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleToggleExtra = (extra: string) => {
    setAddedIngredients((prev) =>
      prev.includes(extra)
        ? prev.filter((e) => e !== extra)
        : [...prev, extra]
    );
  };

  const calculateItemPrice = () => {
    const basePrice = item.price;
    const extrasPrice = addedIngredients.length * 50;
    return (basePrice + extrasPrice) * quantity;
  };

  const handleConfirmAdd = () => {
    addToCart(item, quantity, excludedIngredients, addedIngredients, customInstructions);
    onClose();
  };

  // Modern Indian culinary additions
  const EXTRAS_TEMPLATES = [
    'Pure Cow Ghee Drizzle',
    'Extra Kashmiri Saffron',
    'Roasted Cashew Sprinkles',
    'Fresh Cilantro & Chili Twist'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center" id="customizer-modal-root">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          id="customizer-backdrop"
        />

        {/* Modal Sheet aligned to Brilixis light theme */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="relative w-full max-w-md bg-[#FFFDF8] border-t border-[#ECE7E1] rounded-t-[2.5rem] shadow-brilixis-lg overflow-y-auto max-h-[92vh] no-scrollbar z-50 text-[#2D2D2D]"
          id="customizer-panel"
        >
          {/* Top cover image */}
          <div className="relative h-56 w-full bg-[#FFFDF8]">
            <img
              src={item.imageUrl}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FFFDF8] to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="btn-icon absolute top-4 right-4 p-2 rounded-full w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md"
              id="close-customizer-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal details */}
          <div className="p-6 pt-2">
            <div className="flex justify-between items-start gap-3 mb-2">
              <div>
                {/* Veg / Non-veg badges */}
                <div className="flex gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    item.isVeg 
                      ? 'bg-emerald-50 text-[#2A9D8F] border border-emerald-200' 
                      : 'bg-red-50 text-[#EB5757] border border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-[#2A9D8F]' : 'bg-[#EB5757]'}`} />
                    {item.isVeg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
                  </span>
                  
                  {item.isSignature && (
                    <span className="bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold">
                      CHEF'S CHOICE
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-display font-extrabold text-[#2D2D2D] tracking-tight leading-tight">
                  {item.name}
                </h2>
              </div>

              <div className="flex items-baseline gap-0.5" id="customizer-price-badge">
                <span className="text-xs font-mono text-[#E76F51] font-bold">₹</span>
                <span className="text-xl font-display font-black text-[#2D2D2D]">
                  {item.price}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
              {item.description}
            </p>

            {/* Customizer Option 1: Ingredient Exclusions */}
            <div className="mb-6">
              <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-3 flex items-center gap-1.5 font-mono">
                <span>Exclude Ingredients</span>
                <span className="text-[10px] font-normal text-[#6B7280] capitalize italic font-sans">(Tap to omit)</span>
              </h3>

              <div className="flex flex-wrap gap-2" id="exclusion-chips">
                {item.ingredients.map((ingredient) => {
                  const isExcluded = excludedIngredients.includes(ingredient);
                  return (
                    <button
                      key={ingredient}
                      onClick={() => handleToggleExclude(ingredient)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 border ${
                        isExcluded
                          ? 'bg-red-50 text-[#EB5757] border-dashed border-[#EB5757]/40 line-through'
                          : 'bg-white text-[#2D2D2D] border-[#ECE7E1] hover:border-[#E76F51]/50'
                      }`}
                      id={`omit-chip-${ingredient.replace(/\s+/g, '-')}`}
                    >
                      {ingredient}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customizer Option 2: Add-on Extras with INR rate */}
            <div className="mb-6">
              <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-3 flex items-center justify-between font-mono">
                <span>Enhance Your Plate</span>
                <span className="text-[10px] font-bold font-mono text-[#E76F51] uppercase">+ ₹50 ea</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2" id="extras-grid">
                {EXTRAS_TEMPLATES.map((extra) => {
                  const isAdded = addedIngredients.includes(extra);
                  return (
                    <button
                      key={extra}
                      onClick={() => handleToggleExtra(extra)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                        isAdded
                          ? 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/30 shadow-brilixis-sm font-bold'
                          : 'bg-white text-[#2D2D2D] border-[#ECE7E1] hover:border-[#E76F51]/30'
                      }`}
                      id={`extra-chip-${extra.replace(/\s+/g, '-')}`}
                    >
                      <span className="text-xs font-medium leading-tight">{extra}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isAdded ? 'bg-[#E76F51] border-[#E76F51] text-white' : 'border-[#ECE7E1] text-transparent'
                      }`}>
                        <Check size={10} strokeWidth={4} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customizer Option 3: Additional Notes */}
            <div className="mb-6">
              <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-2 font-mono">
                Special Culinary Instructions
              </h3>
              <textarea
                placeholder="Allergy alerts, spice preference, or specific chef instructions..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                className="input-field p-3.5 text-xs focus:border-[#E76F51] resize-none shadow-brilixis-sm font-sans"
                id="special-directions-textbox"
              />
            </div>

            {/* Stepper + Indian Rupees Confirm Button */}
            <div className="pt-4 border-t border-[#ECE7E1] flex items-center justify-between gap-4">
              {/* Stepper */}
              <div className="flex items-center bg-white border border-[#ECE7E1] rounded-2xl p-1.5 shadow-brilixis-sm" id="customizer-stepper">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-[#6B7280] hover:text-[#E76F51] transition-colors cursor-pointer"
                  title="Decrease Quantity"
                  id="stepper-minus"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 min-w-[2.25rem] text-center font-mono font-bold text-[#2D2D2D] text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-[#6B7280] hover:text-[#E76F51] transition-colors cursor-pointer"
                  title="Increase Quantity"
                  id="stepper-plus"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Confirm CTA */}
              <button
                onClick={handleConfirmAdd}
                className="btn-primary flex-1 py-4 px-6 text-xs uppercase tracking-wider text-center"
                id="stepper-confirm-order"
              >
                Add Dish • ₹{calculateItemPrice()}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
