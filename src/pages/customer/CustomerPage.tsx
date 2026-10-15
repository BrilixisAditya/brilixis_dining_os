import Navbar from "@/src/components/common/Navbar";
import { Bell, ShoppingCart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { HeroSection } from "./components/HeroSection";
import { MenuSection } from "./components/MenuSection";
import { BillCheckoutProcess } from "./components/BillCheckoutProcess";
import { WaiterSummoner } from "./components/WaiterSummoner";
import { MobileSidebar } from "./components/MobileSidebar";
import { ItemSelectorModal } from "./components/ItemSelectorModal";
import { CartDrawer } from "./components/CartDrawer";
import useCart from "@/src/hooks/useCart";
import { WaiterRequest } from "@/src/types/types";
import { triggerCallWaiter } from "@/src/services/waiter_request.service";
import { useCustomerMenu } from "@/src/hooks/useCustomerMenu";

export default function CustomerPage(): React.ReactElement {
  const { session, menuItems, isLoading, error, reload } = useCustomerMenu();
  console.log(menuItems);
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, addToCart } =
    useCart();

  const [customizingItemId, setCustomizingItemId] = useState<string | null>(
    null,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [waiterRequest, setWaiterRequest] = useState<WaiterRequest | null>(
    null,
  );
  const [allWaiterRequests, setAllWaiterRequests] = useState<WaiterRequest[]>(
    [],
  );

  const tableNumber = session?.tableName ?? "None";
  const selectedItemToCustomize = useMemo(
    () => menuItems.find((item) => item.id === customizingItemId) ?? null,
    [menuItems, customizingItemId],
  );

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartPrice = cart.reduce(
    (total, item) =>
      total +
      (item.menuItem.price + item.addedIngredients.length * 50) * item.quantity,
    0,
  );

  if (isLoading) {
    return <CustomerLoadingState />;
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6 text-center">
        <div className="max-w-md card-surface p-8">
          <Sparkles size={20} className="mx-auto text-[#C83214] mb-4" />
          <h1 className="text-xl font-display font-black text-[#1F2226]">
            Menu unavailable
          </h1>
          <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
            {error ?? "The table session could not be established."}
          </p>
          <button
            onClick={() => void reload()}
            className="btn-primary mt-6 mx-auto px-6 py-3 text-xs uppercase tracking-wider"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const featuredItem =
    menuItems.find((item) => item.isSignature) ?? menuItems[0] ?? null;

  return (
    <div
      className="min-h-screen bg-[#FAF9F6] text-[#1F2226] selection:bg-[#C83214] selection:text-white relative"
      id="app-layout"
    >
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#C83214]/5 to-transparent pointer-events-none z-0" />

      <Navbar
        tableNumber={tableNumber ?? ""}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        onCallWaiter={setAllWaiterRequests}
      />

      <main
        className="relative max-w-5xl mx-auto px-4 pt-4 pb-28 sm:px-6 z-10"
        id="main-content"
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E8E5DD] rounded-[1.5rem] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 shadow-sm"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#C83214]" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#C83214] font-bold">
                Assigned Table Access
              </span>
            </div>
            <h2 className="text-sm font-display font-medium text-[#1F2226] tracking-tight mt-0.5">
              Welcome
              {session.restaurantName
                ? ` to ${session.restaurantName}`
                : ""}{" "}
              <span className="text-[#C83214] font-bold">
                Table {tableNumber.toString().padStart(2, "0")}
              </span>{" "}
              • Session Active
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#8C7A6B] font-bold">
            QR VERIFIED
          </span>
        </motion.div>

        <HeroSection
          item={featuredItem}
          onCustomizeItem={setCustomizingItemId}
        />

        <MenuSection
          menuItems={menuItems}
          onCustomizeItem={setCustomizingItemId}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <BillCheckoutProcess tableNumber={tableNumber} />

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
              Your request is associated with the verified table session.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <WaiterSummoner
              tableNumber={tableNumber}
              setAllWaiterRequest={setAllWaiterRequests}
              waiterRequest={waiterRequest}
              setWaiterRequest={setWaiterRequest}
            />
          </div>
        </section>
      </main>

      {cartCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40"
        >
          <div className="bg-white/95 backdrop-blur-lg border border-[#E8E5DD] rounded-2xl p-3 flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-11 h-11 rounded-xl bg-[#C83214] flex items-center justify-center text-white font-bold shadow-md cursor-pointer"
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
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  triggerCallWaiter(
                    "general",
                    "Summon Host",
                    tableNumber,
                    setAllWaiterRequests,
                  )
                }
                disabled={!!waiterRequest}
                className={`px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-mono font-semibold transition-all ${waiterRequest ? "bg-[#C83214]/15 text-[#C83214] border-[#C83214]/25" : "bg-[#FAF9F6] border-[#E8E5DD] text-[#4A4F55]"}`}
              >
                <Bell
                  size={12}
                  className={waiterRequest ? "animate-bounce" : ""}
                />{" "}
                Call
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-[#C83214] text-white px-4 py-2.5 rounded-xl text-[10px] font-display font-medium tracking-wide uppercase"
              >
                View Cart
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <MobileSidebar
        tableNumber={tableNumber}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {selectedItemToCustomize && (
        <ItemSelectorModal
          item={selectedItemToCustomize}
          onClose={() => setCustomizingItemId(null)}
          addToCart={addToCart}
        />
      )}

      <CartDrawer
        tableNumber={tableNumber}
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

function CustomerLoadingState() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#E8E5DD] border-t-[#C83214] rounded-full animate-spin mx-auto" />
        <p className="text-sm font-display font-bold text-[#2D2D2D] mt-4">
          Verifying table QR...
        </p>
        <p className="text-xs text-[#6B7280] mt-1">
          Loading the restaurant menu.
        </p>
      </div>
    </div>
  );
}
