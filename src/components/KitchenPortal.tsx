import React, { useMemo, useEffect, useState } from 'react';
import { ChefHat, Timer, Check, AlertTriangle, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Helper component to render elapsed time stopwatch on active KOT cards
const CookingStopwatch: React.FC<{ startTimeIso: string }> = ({ startTimeIso }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = new Date(startTimeIso).getTime();
    const updateTime = () => {
      const diff = Math.floor((Date.now() - start) / 1000);
      setSeconds(diff > 0 ? diff : 0);
    };

    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, [startTimeIso]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const displayTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-1 font-mono text-[10px] uppercase font-black px-2 py-1 rounded-lg ${
      minutes >= 5 ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-[#FAF9F6] text-[#8C7A6B] border border-[#ECE7E1]'
    }`}>
      <Timer size={10} />
      <span>{displayTime}</span>
    </div>
  );
};

export const KitchenPortal: React.FC = () => {
  const { allOrders, updateOrderStatus, setActiveRole } = useApp();

  const handleLogout = () => {
    setActiveRole('login');
  };

  // Get all active orders in the kitchen (submitted to kitchen or actively preparing)
  const kitchenKots = useMemo(() => {
    return allOrders.filter((ord) => 
      ord.status === 'sent_to_kitchen' || ord.status === 'preparing'
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [allOrders]);

  // Handler to start prepping
  const handleStartPrep = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  // Handler to complete cooking ("cooked and sent outside" -> we transition status to served/ready)
  const handleCompleteCooking = (orderId: string) => {
    updateOrderStatus(orderId, 'ready'); 
    
    // Auto shift to 'served' state after a small offset to simulate waiter carrying plate
    setTimeout(() => {
      updateOrderStatus(orderId, 'served');
    }, 4000);
  };

  return (
    <div className="space-y-8 p-4 md:p-6 text-[#2D2D2D]" id="kitchen-page">
      {/* Upper Navigation Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-surface p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E76F51]/10 border border-[#E76F51]/20 flex items-center justify-center text-xl">
            🍳
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#E76F51] font-bold block">
              Back-of-House Burners Queue
            </span>
            <h2 className="text-xl font-display font-black text-[#2D2D2D] tracking-tight">
              KOT Display Dispatch Console
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#6B7280] font-mono block">LIVE TICKETS IN QUEUE</span>
            <span className="text-sm font-display font-black text-[#E76F51]">{kitchenKots.length} Tickets active</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn-outline px-4 py-2 text-xs flex items-center gap-2"
            id="kitchen-exit-btn"
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      </div>

      {/* Main KOT streams (3 columns responsive bento grid) */}
      {kitchenKots.length === 0 ? (
        <div className="card-surface p-12 text-center max-w-xl mx-auto" id="kitchen-empty-slate">
          <span className="text-4xl">🔥</span>
          <h3 className="text-sm font-display font-bold text-[#2D2D2D] mt-4">
            Burners Resting • Clean Grid
          </h3>
          <p className="text-xs text-[#6B7280] mt-2 max-w-xs mx-auto">
            All tables are served and accounted for. If visitors send unapproved orders from tableside, dining stewards will approve them via the Waiter Terminal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="kot-grid">
          {kitchenKots.map((kot) => {
            const isPreparing = kot.status === 'preparing';
            
            return (
              <div 
                key={kot.id}
                className={`bg-white border rounded-[2rem] p-6 shadow-brilixis-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                  isPreparing 
                    ? 'border-orange-300 ring-1 ring-orange-200' 
                    : 'border-[#E76F51]/25 ring-2 ring-[#E76F51]/5'
                }`}
                id={`kot-${kot.id}`}
              >
                {/* Visual Accent top lighting bar */}
                <div className={`absolute top-0 inset-x-0 h-1.5 ${isPreparing ? 'bg-gradient-to-r from-orange-400 to-amber-400' : 'bg-gradient-to-r from-[#E76F51] to-[#D95D3F]'}`} />

                <div>
                  {/* Ticket Header */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-[#ECE7E1]">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-display font-black text-[#2D2D2D]">
                          Table {kot.tableNumber.toString().padStart(2, '0')}
                        </span>
                        {!isPreparing && (
                          <span className="text-[7.5px] uppercase font-mono font-black text-rose-700 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded-full block animate-pulse">
                            New queue
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-[#6B7280] block uppercase font-bold">
                        Hush Waiter: {kot.waiterName || 'Steward Group'}
                      </span>
                    </div>

                    <CookingStopwatch startTimeIso={kot.createdAt} />
                  </div>

                  {/* Bullet dishes lists */}
                  <div className="space-y-3.5 my-3" id={`kot-items-${kot.id}`}>
                    {kot.items.map((it) => (
                      <div key={it.id} className="text-xs">
                        {/* Dish title & Qty */}
                        <div className="flex justify-between items-start">
                          <span className="font-display font-black text-[#2D2D2D] text-xs flex items-start gap-1">
                            <span className="text-[#E76F51] font-mono">[{it.quantity}x]</span>
                            <span className="leading-tight">{it.menuItem.name}</span>
                          </span>
                        </div>

                        {/* Ingredients exclusions / Gold Toppings details list */}
                        {it.excludedIngredients.length > 0 && (
                          <div className="mt-1 pl-4">
                            {it.excludedIngredients.map((ex) => (
                              <span key={ex} className="text-[8.5px] font-mono text-rose-700 bg-rose-50 border border-rose-100 px-1 rounded inline-block mr-1">
                                ✕ No {ex}
                              </span>
                            ))}
                          </div>
                        )}

                        {it.addedIngredients.length > 0 && (
                          <div className="mt-1 pl-4">
                            {it.addedIngredients.map((ad) => (
                              <span key={ad} className="text-[8.5px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 px-1 rounded inline-block mr-1 font-extrabold uppercase">
                                ✓ Add {ad.replace('Drizzle', '').replace('Strands', '').replace('Paste', '')}
                              </span>
                            ))}
                          </div>
                        )}

                        {it.customInstructions && (
                          <div className="mt-1 pl-4 flex items-start gap-1 p-1 bg-amber-50/50 rounded-lg border border-amber-200">
                            <AlertTriangle size={8} className="text-amber-600 mt-0.5 flex-none" />
                            <p className="text-[8.5px] text-amber-800 font-medium leading-tight">
                              Instructor: "{it.customInstructions}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary State Controller Button */}
                <div className="mt-6 pt-3 border-t border-[#ECE7E1]">
                  {!isPreparing ? (
                    <button
                      onClick={() => handleStartPrep(kot.id)}
                      className="w-full py-3 bg-[#2D2D2D] hover:bg-[#E76F51] text-white rounded-xl text-[10px] font-display font-medium tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-brilixis-sm flex items-center justify-center gap-1.5"
                    >
                      <ChefHat size={12} /> Start Preparing
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteCooking(kot.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-display font-medium tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-brilixis-sm flex items-center justify-center gap-1.5"
                      id={`complete-kot-${kot.id}`}
                    >
                      <Check size={12} strokeWidth={3} /> Out / Order Completed
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
