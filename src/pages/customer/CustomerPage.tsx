import Navbar from "@/src/components/common/Navbar";
import { Bell, ShoppingCart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { HeroSection } from "./components/HeroSection";
import { MenuSection } from "./components/MenuSection";
import { BillCheckoutProcess } from "./components/BillCheckoutProcess";
import { WaiterSummoner } from "./components/WaiterSummoner";
import { MobileSidebar } from "./components/MobileSidebar";
import { TableSwitcher } from "./components/TableSwitcher";
import { ItemSelectorModal } from "./components/ItemSelectorModal";
import { CartDrawer } from "./components/CartDrawer";
import { MENU_ITEMS } from "@/src/types/menuData";
import { useEffect, useState } from "react";
import useCart from "@/src/hooks/useCart";
import { WaiterRequest } from "@/src/types/types";
import { triggerCallWaiter } from "@/src/services/waiter_request.service";
import { useAuth } from "@/src/context/AuthContext";

export default function CustomerPage(): React.ReactElement {

  const [customizingItemId, setCustomizingItemId] = useState<string | null>(
    null,
  );

  const selectedItemToCustomize = customizingItemId
    ? MENU_ITEMS.find((item) => item.id === customizingItemId) || null
    : null;

  // consuming useCart hook
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, addToCart } = useCart();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartPrice = cart.reduce((acc, item) => {
    const itemExtrasPrice = item.addedIngredients.length * 50; // ₹50 each extra add
    return acc + (item.menuItem.price + itemExtrasPrice) * item.quantity;
  }, 0);

  // states from AppContext
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTableSwitcherOpen, setIsTableSwitcherOpen] =
    useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("starters");

  // read from url and settableNumber
  const setTableNumberState = (num: number) => {
    if (num >= 1 && num <= 10) {
      setTableNumber(num);
      const newUrl = `${window.location.pathname}?table=${num}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }
  };

  // waiter request module
  // Single active pager for the currently simulated guest table
  const [waiterRequest, setWaiterRequest] = useState<WaiterRequest | null>(
    null,
  );

  // later we will use api request to fetch waiterrequests from useEffect
  const [allWaiterRequests, setAllWaiterRequests] = useState<WaiterRequest[]>(
    () => {
      const saved = localStorage.getItem("hush_all_waiter_requests");
      return saved ? JSON.parse(saved) : [];
    },
  );

  useEffect(() => {
    localStorage.setItem(
      "hush_all_waiter_requests",
      JSON.stringify(allWaiterRequests),
    );
  }, [allWaiterRequests]);

  // Sync Guest specific WaiterRequest based on this table's status in allWaiterRequests
  useEffect(() => {
    const matchingReq = allWaiterRequests.find(
      (r) => r.tableNumber === tableNumber && r.status !== "resolved",
    );
    if (matchingReq) {
      setWaiterRequest(matchingReq);
    } else {
      // Look for a resolved request that hasn't been dismissed yet to show resolution state
      const resolvedReq = allWaiterRequests.find(
        (r) => r.tableNumber === tableNumber && r.status === "resolved",
      );
      if (resolvedReq) {
        setWaiterRequest(resolvedReq);
      } else {
        setWaiterRequest(null);
      }
    }
  }, [allWaiterRequests, tableNumber]);


  // Automatically trigger a Waiter Service Summon to highlight this draft order to waiters immediately
    // const reqId = `req-draft-${Date.now()}`;
    // const newRequest: WaiterRequest = {
    //   id: reqId,
    //   type: 'general',
    //   label: 'Draft Order Verification Placed',
    //   tableNumber: tableNumber ?? 0,
    //   status: 'requested',
    // };
    
    // setAllWaiterRequests((prev) => [...prev, newRequest]);


    const {user} = useAuth();

  return (
    <div
      className="min-h-screen bg-[#FAF9F6] text-[#1F2226] selection:bg-[#C83214] selection:text-white relative"
      id="app-layout"
    >
      {/* Premium subtle warm ambient top highlight light tone glow */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#C83214]/5 to-transparent pointer-events-none z-0" />

      {/* Luxury Navigation Header */}
      <Navbar
  tableNumber={tableNumber ?? 0}
  onOpenCart={() => setIsCartOpen(true)}
  onOpenSidebar={() => setIsMobileSidebarOpen(true)}
  onOpenTableSwitcher={() => setIsTableSwitcherOpen(true)}
  onCallWaiter={setAllWaiterRequests}
/>

      {/* Main Container */}
      <main
        className="relative max-w-5xl mx-auto px-4 pt-4 pb-28 sm:px-6 z-10"
        id="main-content"
      >
        {/* Dynamic Welcome & Table Info Bar - Light Luxury style card */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E8E5DD] rounded-[1.5rem] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 shadow-sm"
          id="welcome-coordinate-bar"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#C83214]" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#C83214] font-bold">
                Assigned Table Access
              </span>
            </div>
            <h2 className="text-sm font-display font-medium text-[#1F2226] tracking-tight mt-0.5">
              Welcome to{" "}
              <span className="text-[#C83214] font-bold">
                Hush Table {tableNumber?.toString().padStart(2, "0")}
              </span>{" "}
              • Session Active
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-mono text-[#8C7A6B] font-bold">
              TAP TABLE BADGE FOR QR SIMULATOR
            </span>
          </div>
        </motion.div>

        {/* 1. Signature Dish Hero Spot */}
        <HeroSection onCustomizeItem={setCustomizingItemId} />

        {/* 2. Interactive Menu Listings Grid */}
        <MenuSection
          onCustomizeItem={setCustomizingItemId}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* 3. Tableside Active Bill checkout Process center */}
        <BillCheckoutProcess tableNumber={tableNumber ?? 0} />

        {/* 4. Dedicated Tableside Summon / Callback Panel at the bottom of the page */}
        <section
          className="mt-14 pt-10 border-t border-[#E8E5DD]"
          id="summoner-standalone"
        >
          <div className="max-w-xl mx-auto text-center mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C83214] font-bold">
              Immediate Assistance
            </span>
            <h3 className="text-lg font-display font-bold text-[#1F2226] mt-1">
              Need Something Else? Call Waiter Instantly
            </h3>
            <p className="text-xs text-[#5C6168] mt-1 max-w-sm mx-auto">
              Our automated tableside locator page immediately tags your request
              to Table {tableNumber?.toString().padStart(2, "0")} and alerts our
              nearest host.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <WaiterSummoner tableNumber={tableNumber ?? 0} setAllWaiterRequest={setAllWaiterRequests} waiterRequest={waiterRequest} setWaiterRequest={setWaiterRequest} />
          </div>
        </section>
      </main>

      {/* 5. FLOATING MOBILE FAST-ACTION BOTTOM BAR (Shows in light premium style when items in cart) */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 200 }}
          className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40"
          id="floating-checkout-nav"
        >
          <div className="bg-white/95 backdrop-blur-lg border border-[#E8E5DD] rounded-2xl p-3 flex justify-between items-center shadow-xl">
            {/* Left cart totals summary */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-11 h-11 rounded-xl bg-[#C83214] flex items-center justify-center text-white font-bold shadow-md shadow-[#C83214]/20 cursor-pointer"
                id="floating-cart-trigger"
              >
                <ShoppingCart size={15} />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#C83214] font-mono font-bold text-[9px] w-4.5 h-4.5 rounded-full border border-[#C83214] flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </button>

              <div className="leading-tight">
                <span className="text-[9px] font-mono text-[#8C7A6B] block uppercase font-bold">
                  Cart Subtotal
                </span>
                <span className="text-sm font-mono font-bold text-[#1F2226] block">
                  ₹{cartPrice}
                </span>
              </div>
            </div>

            {/* Right summons and view buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerCallWaiter("general", "Summon Host", tableNumber??0, setAllWaiterRequests)}
                disabled={!!waiterRequest}
                className={`px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                  waiterRequest
                    ? "bg-[#C83214]/15 text-[#C83214] border-[#C83214]/25"
                    : "bg-[#FAF9F6] border-[#E8E5DD] text-[#4A4F55] hover:bg-white"
                }`}
                id="floating-summon-btn"
              >
                <Bell
                  size={12}
                  className={waiterRequest ? "animate-bounce" : ""}
                />
                Call Table {tableNumber}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-[#C83214] hover:bg-[#D73C1E] text-white px-4 py-2.5 rounded-xl text-[10px] font-display font-medium tracking-wide uppercase transition-all cursor-pointer shadow-sm"
                id="floating-open-cart"
              >
                View Cart
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- FLOATING SHEETS & OVERLAYS --- */}

      {/* Swipeable or Three-line action menu sidebar for only mobile users */}
      <MobileSidebar
        tableNumber={tableNumber ?? 0}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* Table scan simulator sheet overlay */}
      <TableSwitcher
        tableNumber={tableNumber ?? 0}
        setTableNumberState={setTableNumberState}
        isTableSwitcherOpen={isTableSwitcherOpen}
        setIsTableSwitcherOpen={setIsTableSwitcherOpen}
      />

      {/* Customizer Option modifier modal overlay */}
      {selectedItemToCustomize && (
        <ItemSelectorModal
          item={selectedItemToCustomize}
          onClose={() => setCustomizingItemId(null)}
          addToCart={addToCart}
        />
      )}

      {/* Expandable right checkout drawer overlay */}
      <CartDrawer
        tableNumber={tableNumber ?? 0}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        removeFromCart={removeFromCart}
        updateCartItemQuantity={updateCartItemQuantity}
        clearCart={clearCart}
        waiterRequest={waiterRequest}
      />
    </div>
  );
}
