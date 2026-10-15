import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Receipt,
  User,
  Phone,
  KeyRound,
  Sparkles,
  AlertCircle,
  CreditCard,
  Smartphone,
  ArrowRight,
  Download,
  Send,
} from "lucide-react";
import useOrders from "@/src/hooks/useOrders";

export const BillCheckoutProcess: React.FC<{ tableNumber: string }> = ({
  tableNumber,
}) => {
  const { orders } = useOrders();

  const [allOrders, setAllOrders] = useState(orders);

  // Find active billing order for this table
  const activeOrder = useMemo(() => {
    return (
      allOrders.find(
        (o) =>
          o.tableNumber === 0 &&
          [
            "served",
            "ready",
            "bill_requested",
            "sent_to_kitchen",
            "preparing",
            "draft_submitted",
          ].includes(o.status),
      ) || null
    );
  }, [allOrders, tableNumber]);

  // UI state machine: 'idle' | 'details' | 'otp' | 'payment_gateway' | 'invoice_completed'
  const [checkoutStep, setCheckoutStep] = useState<
    "idle" | "details" | "otp" | "payment" | "invoice"
  >("idle");

  // Forms inputs
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formError, setFormError] = useState("");

  // Payment gateway selections
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "net">("upi");
  const [upiId, setUpiId] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!activeOrder) return null;

  // Render a banner or checkout box based on status
  const canSettle = ["served", "ready", "bill_requested"].includes(
    activeOrder.status,
  );

  const startCheckout = () => {
    if (!canSettle) return;
    setCheckoutStep("details");
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      setFormError("Please fill in both Name and Contact number.");
      return;
    }
    if (custPhone.replace(/\D/g, "").length < 10) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }
    setFormError("");
    setCheckoutStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setFormError("Please enter the 4-digit code.");
      return;
    }
    setFormError("");
    setCheckoutStep("payment");
  };

  const handleSettlePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      // Settle order via shared global context API
      // payBillForOrder(activeOrder.id, custName, custPhone);
      setIsProcessingPayment(false);
      setCheckoutStep("invoice");
      // clearCart(); // Clean customer cart physically
    }, 2500);
  };

  const handleClose = () => {
    setCheckoutStep("idle");
    setCustName("");
    setCustPhone("");
    setOtpCode("");
  };

  return (
    <div
      className="card-surface p-6 mb-8 text-[#2D2D2D]"
      id="bill-checkout-module"
    >
      {/* Top Banner indicating Active Ticket Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-[#E76F51]/10 rounded-2xl border border-[#E76F51]/20 text-[#E76F51]">
          <Receipt size={20} />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-[#2D2D2D]">
            Table {tableNumber.toString().padStart(2, "0")} Billing Center
          </h3>
          <p className="text-[10px] text-[#6B7280] font-mono leading-none tracking-widest uppercase mt-0.5">
            OrderID: {activeOrder?.id}
          </p>
        </div>
      </div>

      {/* Conditionally reveal orders list and checkouts */}
      {!canSettle ? (
        <div className="p-3.5 bg-[#FFFDF8] border border-[#ECE7E1] rounded-2xl flex items-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#E76F51] mt-1 animate-pulse" />
          <div>
            <p className="text-xs font-bold leading-tight text-[#2D2D2D]">
              Order In Preparation
            </p>
            <p className="text-[10px] text-[#6B7280] mt-0.5 leading-normal">
              Our culinary team is currently preparing your dishes. Once served,
              your billing terminal will unlock here instantly!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Your dishes have been served. You can review your itemized receipt
            and settle payment securely.
          </p>

          {/* Quick Invoice Summary Panel */}
          <div className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#ECE7E1] space-y-2.5">
            <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar text-xs">
              {activeOrder.items.map((it) => (
                <div
                  key={it.id}
                  className="flex justify-between items-start font-medium text-[#2D2D2D]"
                >
                  <span>
                    {it.quantity}x {it.menuItem.name}
                  </span>
                  <span className="font-mono text-[11px]">
                    ₹{it.menuItem.price * it.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#ECE7E1] pt-2.5 text-[11px] space-y-1 text-[#6B7280]">
              <div className="flex justify-between font-mono">
                <span>Subtotal</span>
                <span>₹{activeOrder.subtotal}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>GST & Service Charge (18%)</span>
                <span>₹{Math.round(activeOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-mono font-black text-[#E76F51] border-t border-dashed border-[#ECE7E1] pt-1.5 text-xs">
                <span>Grand Total</span>
                <span>₹{Math.round(activeOrder.total)}</span>
              </div>
            </div>
          </div>

          {/* Settle Action Key */}
          {activeOrder.status !== "paid" && (
            <button
              onClick={startCheckout}
              className="btn-primary w-full py-3.5 uppercase text-xs tracking-wider flex items-center justify-center gap-1.5"
              id="initiate-checkout-btn"
            >
              Examine Receipt & Settle Bill
            </button>
          )}
        </div>
      )}

      {/* --- LIVE MULTI-STEP CHECKOUT SHEET OVERLAYS (MODAL) --- */}
      <AnimatePresence>
        {checkoutStep !== "idle" && (
          <>
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs"
            />

            {/* Float content Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#FFFDF8] border-t border-[#ECE7E1] rounded-t-[2.5rem] p-6 pb-12 z-50 shadow-brilixis-lg text-[#2D2D2D]"
              id="checkout-sheet-portal"
            >
              {/* Drag Bar */}
              <div className="w-12 h-1 bg-[#ECE7E1] rounded-full mx-auto mb-6" />

              {/* STAGE 1: Name and Phone */}
              {checkoutStep === "details" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-display font-extrabold text-[#2D2D2D] tracking-tight">
                      Guest Verification
                    </h4>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Enter your details to receive SMS statements & secure
                      receipt.
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-[#EB5757] text-[11px] rounded-xl flex items-center gap-2">
                      <AlertCircle size={13} className="flex-none" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="relative">
                      <User
                        size={13}
                        className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />
                      <input
                        type="text"
                        placeholder="Guest Name (e.g. Aditya Darji)"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="input-field pl-10 pr-4 py-3.5 text-xs font-display"
                      />
                    </div>

                    <div className="relative">
                      <Phone
                        size={13}
                        className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />
                      <input
                        type="tel"
                        placeholder="Contact Number (e.g. 9876543210)"
                        required
                        maxLength={10}
                        value={custPhone}
                        onChange={(e) =>
                          setCustPhone(e.target.value.replace(/\D/g, ""))
                        }
                        className="input-field pl-10 pr-4 py-3.5 text-xs font-display"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 uppercase text-xs tracking-wider flex justify-center items-center gap-2"
                  >
                    Send One-Time Code <ArrowRight size={12} />
                  </button>
                </form>
              )}

              {/* STAGE 2: OTP Verification */}
              {checkoutStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-display font-extrabold text-[#2D2D2D] tracking-tight flex items-center gap-1.5">
                      <KeyRound size={18} className="text-[#E76F51]" />{" "}
                      Verification Code
                    </h4>
                    <p className="text-xs text-[#6B7280] mt-1">
                      A code was sent to{" "}
                      <span className="font-bold text-[#2D2D2D] font-mono">
                        +91 {custPhone}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] rounded-xl font-mono">
                    💡 DEMO PASSCODE: Enter any 4-digit PIN (e.g.,{" "}
                    <span className="font-bold underline">1234</span>).
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter 4-Digit Code"
                      required
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full text-center font-mono text-lg font-black tracking-widest bg-white border border-[#ECE7E1] rounded-2xl py-3 placeholder-[#6B7280]/30 focus:outline-none focus:border-[#E76F51] text-[#2D2D2D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#2D2D2D] hover:bg-black text-white rounded-2xl text-xs font-display font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    Authorize Access
                  </button>
                </form>
              )}

              {/* STAGE 3: PAYMENT GATEWAY SIMULATION */}
              {checkoutStep === "payment" && (
                <div className="space-y-5" id="razorpay-panel">
                  {/* Gateway Branded Header */}
                  <div className="flex justify-between items-center bg-[#2A9D8F]/10 border border-[#2A9D8F]/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F] animate-ping" />
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-[#2A9D8F] block">
                          Secure Gateway
                        </span>
                        <h4 className="text-xs font-display font-bold text-[#2D2D2D] mt-0.5">
                          Brilixis Dining Checkout
                        </h4>
                      </div>
                    </div>
                    <div className="text-right font-mono text-sm font-black text-[#2A9D8F]">
                      ₹{Math.round(activeOrder.total)}
                    </div>
                  </div>

                  {/* Payment Method selectors */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <button
                      onClick={() => setPayMethod("upi")}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        payMethod === "upi"
                          ? "border-[#2A9D8F] bg-[#2A9D8F]/10 text-[#2A9D8F] font-bold"
                          : "border-[#ECE7E1] bg-white text-[#6B7280] hover:text-[#2D2D2D]"
                      }`}
                    >
                      <Smartphone size={13} />
                      <span className="text-[10px] font-display">UPI / QR</span>
                    </button>
                    <button
                      onClick={() => setPayMethod("card")}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        payMethod === "card"
                          ? "border-[#2A9D8F] bg-[#2A9D8F]/10 text-[#2A9D8F] font-bold"
                          : "border-[#ECE7E1] bg-white text-[#6B7280] hover:text-[#2D2D2D]"
                      }`}
                    >
                      <CreditCard size={13} />
                      <span className="text-[10px] font-display">Card</span>
                    </button>
                    <button
                      onClick={() => setPayMethod("net")}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        payMethod === "net"
                          ? "border-[#2A9D8F] bg-[#2A9D8F]/10 text-[#2A9D8F] font-bold"
                          : "border-[#ECE7E1] bg-white text-[#6B7280] hover:text-[#2D2D2D]"
                      }`}
                    >
                      <Sparkles size={11} />
                      <span className="text-[10px] font-display">
                        Net Banking
                      </span>
                    </button>
                  </div>

                  {/* Context Sensitive input forms */}
                  <div className="p-4 bg-white rounded-2xl border border-[#ECE7E1] space-y-3">
                    {payMethod === "upi" && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold block">
                          Enter VPA Address ID
                        </label>
                        <input
                          type="text"
                          placeholder="aditya@okaxis, or pay@upi..."
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="input-field px-3 py-2.5 text-xs font-mono"
                        />
                      </div>
                    )}
                    {payMethod === "card" && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold block">
                          Card Details
                        </label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444 (VISA)"
                          maxLength={19}
                          className="input-field px-3 py-2 text-xs font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            className="input-field px-3 py-2 text-xs font-mono"
                          />
                          <input
                            type="password"
                            placeholder="CVV"
                            maxLength={3}
                            className="input-field px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                    {payMethod === "net" && (
                      <div className="space-y-1.5 text-xs font-medium">
                        <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold block">
                          Select Bank
                        </label>
                        {[
                          "State Bank of India",
                          "HDFC Bank Limited",
                          "ICICI Bank",
                          "Axis Bank",
                        ].map((bank) => (
                          <label
                            key={bank}
                            className="flex items-center gap-2.5 p-1 px-1.5 hover:bg-[#FFFDF8] rounded-lg cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="bank"
                              defaultChecked={bank.includes("SBI")}
                              className="accent-[#2A9D8F]"
                            />
                            <span>{bank}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Gateway settle block */}
                  <button
                    onClick={handleSettlePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-4 bg-[#2A9D8F] hover:bg-[#238377] text-white rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all flex justify-center items-center gap-2 cursor-pointer shadow-brilixis-sm"
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <span>Complete Payment</span>
                    )}
                  </button>
                </div>
              )}

              {/* STAGE 4: DIGITAL TAX INVOICE */}
              {checkoutStep === "invoice" && (
                <div className="space-y-6" id="final-invoice-sheet">
                  {/* POS Print Bill Mock */}
                  <div className="relative border border-[#ECE7E1] bg-white p-5 rounded-2xl shadow-brilixis-sm text-[#2D2D2D] font-mono text-[10px] space-y-3.5">
                    {/* Circle stamps */}
                    <div className="absolute top-4 right-4 border-2 border-emerald-500/40 text-emerald-600 font-display font-extrabold px-3 py-1 text-[12px] uppercase tracking-widest rounded-lg rotate-12 bg-emerald-50 select-none pointer-events-none">
                      PAID
                    </div>

                    <div className="text-center border-b border-dashed border-[#ECE7E1] pb-3">
                      <p className="font-display font-black text-xs uppercase tracking-wide text-[#2D2D2D]">
                        Brilixis Dining OS
                      </p>
                      <p className="text-[8px] text-[#6B7280] mt-0.5">
                        Tax Invoice Statement
                      </p>
                    </div>

                    {/* Meta coordinates */}
                    <div className="space-y-0.5 border-b border-dashed border-[#ECE7E1] pb-2 bg-[#FFFDF8] p-2 rounded-lg">
                      <p>
                        Guest:{" "}
                        <span className="font-bold">
                          {custName || "Valued Diner"}
                        </span>
                      </p>
                      <p>
                        Number:{" "}
                        <span className="font-bold">
                          +91 {custPhone || "N/A"}
                        </span>
                      </p>
                      <p>Date-Time: {new Date().toLocaleString()}</p>
                      <p>
                        Table:{" "}
                        <span className="font-bold">
                          TBL-{tableNumber.toString().padStart(2, "0")}
                        </span>
                      </p>
                    </div>

                    {/* Items table list */}
                    <div className="space-y-1 py-1">
                      {activeOrder.items.map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span>
                            {it.quantity}x {it.menuItem.name.substring(0, 18)}
                          </span>
                          <span>₹{it.menuItem.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tax computations */}
                    <div className="border-t border-dashed border-[#ECE7E1] pt-2.5 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Invoice Base</span>
                        <span>₹{activeOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-[#6B7280]">
                        <span>GST & Service Charge (18%)</span>
                        <span>₹{Math.round(activeOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between font-black text-xs pt-1 text-emerald-800 border-t border-[#ECE7E1] mt-1">
                        <span>Final Settle Sum</span>
                        <span>₹{Math.round(activeOrder.total)}</span>
                      </div>
                    </div>

                    {/* Bottom verification codes */}
                    <div className="pt-2 text-center text-[7px] text-[#6B7280] border-t border-dashed border-[#ECE7E1] leading-normal">
                      Transaction Ref: pay_F93HDNWA92JD
                      <br />
                      Brilixis Dining OS Verified
                    </div>
                  </div>

                  {/* Simulated PDF download & Whatsapp trigger buttons */}
                  <div
                    className="grid grid-cols-2 gap-3"
                    id="invoice-share-actions"
                  >
                    <button
                      onClick={() =>
                        alert(`Billing Receipt PDF downloaded successfully!`)
                      }
                      className="btn-outline py-3 text-[9px] font-mono flex justify-center items-center gap-1"
                    >
                      <Download size={11} /> Save Invoice PDF
                    </button>

                    <button
                      onClick={() =>
                        alert(
                          `Tax Statement sent via WhatsApp to +91 ${custPhone}!`,
                        )
                      }
                      className="py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-[9px] font-mono tracking-wider font-extrabold flex justify-center items-center gap-1 text-emerald-700 transition-colors cursor-pointer"
                    >
                      <Send size={11} /> Send WhatsApp
                    </button>
                  </div>

                  {/* Reset Table back to pristine vacant state */}
                  <button
                    onClick={handleClose}
                    className="btn-primary w-full py-4 text-xs uppercase tracking-wider text-center"
                  >
                    Reset Table & Close Session
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
