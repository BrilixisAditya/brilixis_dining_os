import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Minus, Trash2, BellRing, UtensilsCrossed,
  Receipt, User, Phone, KeyRound, Sparkles, AlertCircle, 
  CreditCard, Smartphone, CheckCircle, ArrowRight, Download, Send,
  Mail, Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    tableNumber,
    waiterRequest,
    triggerCallWaiter,
    allOrders,
    submitDraftOrder,
    payBillForOrder,
    restaurantGstProfile,
  } = useApp();

  const [waiterSummonedForOrder, setWaiterSummonedForOrder] = useState(false);

  // Checkout Multi-step UI states inside drawer
  const [checkoutStep, setCheckoutStep] = useState<'cart_view' | 'details' | 'otp' | 'payment' | 'invoice'>('cart_view');
  
  // Forms inputs
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isBusiness, setIsBusiness] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [formError, setFormError] = useState('');
  
  // Payment gateway selections
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'net'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Lock body scroll on mobile when cart drawer is open
  React.useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleTouchMove = (e: TouchEvent) => {
        const cartPanel = document.getElementById('cart-panel');
        if (cartPanel && !cartPanel.contains(e.target as Node)) {
          if (e.cancelable) e.preventDefault();
        }
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isCartOpen]);

  // Retrieve any active unpaid order for the current table
  const activeOrder = useMemo(() => {
    return allOrders.find(
      (o) => o.tableNumber === tableNumber && o.status !== 'paid'
    ) || null;
  }, [allOrders, tableNumber]);

  const paidOrder = useMemo(() => {
    const paidList = allOrders.filter(
      (o) => o.tableNumber === tableNumber && o.status === 'paid'
    );
    return paidList.length > 0 ? paidList[0] : null;
  }, [allOrders, tableNumber]);

  // Convert number to words helper for print
  const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const g = (n: number): string => {
      if (n < 20) return a[n];
      const digit = n % 10;
      return b[Math.floor(n / 10)] + (digit !== 0 ? '-' + a[digit] : ' ');
    };
    
    const h = (n: number): string => {
      if (n === 0) return '';
      let str = '';
      if (n >= 100) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 0) {
        str += 'and ' + g(n);
      }
      return str;
    };

    if (num === 0) return 'Zero';
    let words = '';
    const cr = Math.floor(num / 10000000);
    num %= 10000000;
    const la = Math.floor(num / 100000);
    num %= 100000;
    const th = Math.floor(num / 1000);
    num %= 1000;
    const hd = num;

    if (cr > 0) words += h(cr) + 'Crore ';
    if (la > 0) words += h(la) + 'Lakh ';
    if (th > 0) words += h(th) + 'Thousand ';
    if (hd > 0) words += h(hd);
    
    return words.trim() + ' Rupees Only';
  };

  const handlePrintInvoice = (order: any) => {
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to print the invoice.');
      return;
    }

    const isB2B = !!order.customerGstin;
    const gstSummary = order.gstSummary || { totalTaxable: order.subtotal, cgst: order.tax/2, sgst: order.tax/2, igst: 0, totalGst: order.tax, roundOff: 0, isInterstate: false };
    const totalInWords = numberToWords(order.total);

    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${order.invoiceNumber}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 40px;
              font-size: 11px;
              line-height: 1.4;
            }
            .invoice-box {
              max-width: 800px;
              margin: auto;
              border: 1px solid #ddd;
              padding: 30px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 8px 10px;
              border: 1px solid #eee;
              text-align: left;
            }
            th {
              background-color: #fcfcfc;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.5px;
            }
            .text-right {
              text-align: right;
            }
            .header-table td {
              border: none;
              padding: 0;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #E76F51;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #555;
              font-weight: bold;
            }
            .badge {
              display: inline-block;
              padding: 3px 8px;
              background-color: #e6f7ed;
              color: #1e7e34;
              border: 1px solid #c3e6cb;
              font-weight: bold;
              border-radius: 3px;
              font-size: 10px;
            }
            .meta-section {
              margin: 20px 0;
              border-top: 1px solid #ddd;
              border-bottom: 1px solid #ddd;
              padding: 15px 0;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .section-title {
              font-size: 10px;
              text-transform: uppercase;
              color: #6B7280;
              font-weight: bold;
              margin-bottom: 8px;
              border-bottom: 1px solid #ECE7E1;
              padding-bottom: 4px;
            }
            .totals-box {
              width: 300px;
              margin-left: auto;
            }
            .totals-box td {
              border: none;
              padding: 4px 10px;
            }
            .totals-box tr.grand-total td {
              border-top: 1px solid #333;
              border-bottom: 1px solid #333;
              font-weight: bold;
              font-size: 13px;
            }
            .tax-breakdown-th {
              font-size: 8px;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #eee;
              padding-top: 20px;
              text-align: center;
              color: #777;
              font-size: 9px;
            }
            .signature-area {
              margin-top: 45px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .signature-block {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              border-top: 1px solid #999;
              margin-top: 50px;
              padding-top: 5px;
            }
            @media print {
              body {
                padding: 0;
              }
              .invoice-box {
                border: none;
                box-shadow: none;
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table class="header-table">
              <tr>
                <td>
                  <div class="title">${restaurantGstProfile.restaurantName}</div>
                  <div class="subtitle">${restaurantGstProfile.legalBusinessName}</div>
                  <p style="margin: 5px 0;">
                    ${restaurantGstProfile.address}<br>
                    State: ${restaurantGstProfile.state} (Code: ${restaurantGstProfile.stateCode}), Pincode: ${restaurantGstProfile.pincode}<br>
                    Phone: ${restaurantGstProfile.phoneNumber} | Email: ${restaurantGstProfile.email}
                  </p>
                  <p style="margin: 5px 0; font-weight: bold;">
                    GSTIN: ${restaurantGstProfile.gstin} ${restaurantGstProfile.fssaiNumber ? ' | FSSAI: ' + restaurantGstProfile.fssaiNumber : ''} ${restaurantGstProfile.pan ? ' | PAN: ' + restaurantGstProfile.pan : ''}
                  </p>
                </td>
                <td class="text-right" style="vertical-align: top;">
                  <h1 style="margin: 0 0 10px 0; font-size: 20px; color: #333;">TAX INVOICE</h1>
                  <div class="badge" style="margin-bottom: 10px;">${isB2B ? 'B2B INVOICE' : 'B2C INVOICE'}</div>
                  <p style="margin: 0;">
                    <strong>Invoice No:</strong> ${order.invoiceNumber}<br>
                    <strong>Date:</strong> ${new Date(order.paymentDetails?.paidAt || order.createdAt).toLocaleString('en-IN')}<br>
                    <strong>Table:</strong> Table ${order.tableNumber.toString().padStart(2, '0')}<br>
                    <strong>FY:</strong> ${restaurantGstProfile.financialYear}
                  </p>
                </td>
              </tr>
            </table>

            <div class="meta-section">
              <div class="grid-2">
                <div>
                  <div class="section-title">Billing Customer Details</div>
                  <p style="margin: 0; font-size: 11px;">
                    <strong>Name:</strong> ${order.customerName}<br>
                    <strong>Contact:</strong> +91 ${order.customerPhone}<br>
                    <strong>Email:</strong> ${order.customerEmail || 'N/A'}<br>
                    ${isB2B ? `<strong>Company Name:</strong> ${order.companyName}<br><strong>GSTIN:</strong> ${order.customerGstin}` : ''}
                  </p>
                </div>
                <div>
                  <div class="section-title">Payment & Gateway Stamp</div>
                  <p style="margin: 0; font-size: 11px;">
                    <strong>Status:</strong> <span style="color: #1e7e34; font-weight: bold;">✔ STAMPED PAID</span><br>
                    <strong>Method:</strong> ${order.paymentDetails?.method || 'UPI Razorpay Secure Gateway'}<br>
                    <strong>Transaction ID:</strong> ${order.paymentDetails?.transactionId}<br>
                    <strong>Paid At:</strong> ${new Date(order.paymentDetails?.paidAt || order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            <div class="section-title">Ordered Culinary Items</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 35%;">Item Description</th>
                  <th style="width: 10%;">HSN Code</th>
                  <th style="width: 8%;" class="text-right">Qty</th>
                  <th style="width: 12%;" class="text-right">Unit Price (₹)</th>
                  <th style="width: 8%;" class="text-right">GST %</th>
                  <th style="width: 12%;" class="text-right">Taxable Val (₹)</th>
                  <th style="width: 10%;" class="text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((it: any, idx: number) => {
                  const rate = it.gstRate !== undefined ? it.gstRate : 5;
                  const hsn = it.hsnCode || '996331';
                  const isInclusive = it.menuItem.isTaxInclusive !== undefined ? it.menuItem.isTaxInclusive : true;
                  const extra = it.addedIngredients ? it.addedIngredients.length * 50 : 0;
                  const unitPrice = it.menuItem.price + extra;
                  const totalLine = unitPrice * it.quantity;

                  let taxable = 0;
                  if (isInclusive) {
                    taxable = totalLine / (1 + (rate / 100));
                  } else {
                    taxable = totalLine;
                  }

                  return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>
                        <strong>${it.menuItem.name}</strong>
                        ${it.addedIngredients && it.addedIngredients.length > 0 ? `<br><small style="color: #666;">+ Extra: ${it.addedIngredients.join(', ')}</small>` : ''}
                        ${it.excludedIngredients && it.excludedIngredients.length > 0 ? `<br><small style="color: #999;">Excluding: ${it.excludedIngredients.join(', ')}</small>` : ''}
                      </td>
                      <td>${hsn}</td>
                      <td class="text-right">${it.quantity}</td>
                      <td class="text-right">${unitPrice.toFixed(2)}</td>
                      <td class="text-right">${rate}%</td>
                      <td class="text-right">${taxable.toFixed(2)}</td>
                      <td class="text-right">${totalLine.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="grid-2" style="margin-top: 20px;">
              <div>
                <div class="section-title">GST Tax Breakup Detail</div>
                <table style="font-size: 9px; margin-bottom: 10px;">
                  <thead>
                    <tr>
                      <th class="tax-breakdown-th">Rate</th>
                      <th class="tax-breakdown-th" class="text-right">Taxable Value (₹)</th>
                      ${gstSummary.isInterstate ? `
                        <th class="tax-breakdown-th" class="text-right">IGST (₹)</th>
                      ` : `
                        <th class="tax-breakdown-th" class="text-right">CGST (₹)</th>
                        <th class="tax-breakdown-th" class="text-right">SGST (₹)</th>
                      `}
                      <th class="tax-breakdown-th" class="text-right">Total Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mix (5%/12%/18%/28%)</td>
                      <td class="text-right">${gstSummary.totalTaxable.toFixed(2)}</td>
                      ${gstSummary.isInterstate ? `
                        <td class="text-right">${gstSummary.igst.toFixed(2)}</td>
                      ` : `
                        <td class="text-right">${gstSummary.cgst.toFixed(2)}</td>
                        <td class="text-right">${gstSummary.sgst.toFixed(2)}</td>
                      `}
                      <td class="text-right">${gstSummary.totalGst.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <p style="margin: 5px 0; font-size: 10px;">
                  <strong>Total in Words:</strong><br>
                  <span style="font-style: italic; color: #555;">${totalInWords}</span>
                </p>
              </div>

              <div>
                <table class="totals-box">
                  <tr>
                    <td>Taxable Subtotal Value:</td>
                    <td class="text-right">₹${gstSummary.totalTaxable.toFixed(2)}</td>
                  </tr>
                  ${gstSummary.isInterstate ? `
                    <tr>
                      <td>Interstate IGST Total:</td>
                      <td class="text-right">₹${gstSummary.igst.toFixed(2)}</td>
                    </tr>
                  ` : `
                    <tr>
                      <td>Central CGST Total:</td>
                      <td class="text-right">₹${gstSummary.cgst.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>State SGST Total:</td>
                      <td class="text-right">₹${gstSummary.sgst.toFixed(2)}</td>
                    </tr>
                  `}
                  <tr>
                    <td>Total Tax Calculated:</td>
                    <td class="text-right">₹${gstSummary.totalGst.toFixed(2)}</td>
                  </tr>
                  ${order.discount ? `
                    <tr style="color: #E76F51;">
                      <td>Discount Applied:</td>
                      <td class="text-right">-₹${order.discount.toFixed(2)}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td>Round Off Adjustment:</td>
                    <td class="text-right">₹${gstSummary.roundOff >= 0 ? '+' + gstSummary.roundOff.toFixed(2) : gstSummary.roundOff.toFixed(2)}</td>
                  </tr>
                  <tr class="grand-total">
                    <td>Grand Total Settle Balance:</td>
                    <td class="text-right">₹${order.total.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="signature-area">
              <div class="signature-block" style="text-align: left;">
                <p style="margin: 0; font-weight: bold; color: #555;">Terms & Conditions</p>
                <p style="margin: 5px 0 0 0; font-size: 8px; color: #777; line-height: 1.3;">
                  1. Subject to local state jurisdiction rules.<br>
                  2. This is a computer-generated tax compliance invoice.<br>
                  3. Hospitality and culinary services were rendered at premises.
                </p>
              </div>
              <div class="signature-block">
                <p style="margin: 0 0 5px 0; font-size: 9px; color: #555; font-weight: bold;">For ${restaurantGstProfile.restaurantName}</p>
                <div class="signature-line">Authorized Signatory</div>
              </div>
            </div>

            <div class="footer">
              Thank you for dining with us at ${restaurantGstProfile.restaurantName}! Truly modern culinary heritage.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const subtotal = cart.reduce((acc, item) => {
    const itemExtrasPrice = item.addedIngredients.length * 50; // ₹50 per extra addon
    return acc + (item.menuItem.price + itemExtrasPrice) * item.quantity;
  }, 0);

  // Taxes & Premium hospitality charge (e.g. 18% GST + Service Charge)
  const taxAndService = subtotal * 0.18;
  const grandTotal = subtotal + taxAndService;

  const handleCallWaiterForOrder = () => {
    if (cart.length === 0) return;
    
    // Call waiter with special order placement request label
    triggerCallWaiter('general', 'Order Verification Call');
    
    // Submit the draft order physically to the system so it appears on waiter & kitchen screens
    submitDraftOrder(tableNumber);
    setWaiterSummonedForOrder(true);
  };

  const handleDismissConfirmation = () => {
    setWaiterSummonedForOrder(false);
    setIsCartOpen(false);
  };

  // Checkout Form Event Handlers
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !custEmail.trim()) {
      setFormError('Please enter Name, Contact number, and Email address.');
      return;
    }
    if (custPhone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!custEmail.trim().includes('@') || !custEmail.trim().includes('.')) {
      setFormError('Please enter a valid Email address.');
      return;
    }
    if (isBusiness) {
      if (!custGstin.trim()) {
        setFormError('GSTIN is required for business billing.');
        return;
      }
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(custGstin.trim().toUpperCase())) {
        setFormError('Please enter a valid 15-character Indian GSTIN (e.g. 27AAPCH1234F1Z5).');
        return;
      }
      if (!companyName.trim()) {
        setFormError('Company Name is required for business billing.');
        return;
      }
    }
    setFormError('');
    setCheckoutStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setFormError('Please enter the 4-digit verification code.');
      return;
    }
    setFormError('');
    setCheckoutStep('payment');
  };

  const handleSettlePayment = () => {
    if (!activeOrder) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      // Settle order via shared global context API
      payBillForOrder(
        activeOrder.id,
        custName,
        custPhone,
        custEmail,
        isBusiness ? custGstin.toUpperCase() : undefined,
        isBusiness ? companyName : undefined
      );
      setIsProcessingPayment(false);
      setCheckoutStep('invoice');
      clearCart(); // Clean customer cart physically
    }, 2000);
  };

  const handleResetTableSession = () => {
    setCheckoutStep('cart_view');
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustGstin('');
    setCompanyName('');
    setIsBusiness(false);
    setOtpCode('');
    setIsCartOpen(false);
  };

  const startCheckout = () => {
    setCheckoutStep('details');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" id="cart-drawer-root">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            id="cart-backdrop"
          />

          {/* Drawer Right Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#FFFDF8] h-full flex flex-col shadow-brilixis-lg z-55 border-l border-[#ECE7E1] text-[#2D2D2D]"
            id="cart-panel"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#ECE7E1] flex justify-between items-center bg-white" id="cart-header">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#E76F51] font-bold uppercase block">
                  Table {tableNumber.toString().padStart(2, '0')} review
                </span>
                <h2 className="text-xl font-display font-black text-[#2D2D2D] tracking-tight mt-0.5">
                  {checkoutStep === 'cart_view' && 'Your Dining Cart'}
                  {checkoutStep === 'details' && 'Diners Verification'}
                  {checkoutStep === 'otp' && 'SMS OTP Authenticator'}
                  {checkoutStep === 'payment' && 'Razorpay Gateway'}
                  {checkoutStep === 'invoice' && 'Dine Invoice Stamp'}
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-icon p-2.5 rounded-full"
                id="close-cart-drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* If Order Verification with Waiter is Active */}
            {waiterSummonedForOrder ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white"
                id="waiter-assigned-order-screen"
              >
                <div className="w-18 h-18 rounded-full bg-[#E76F51]/10 border border-[#E76F51]/20 flex items-center justify-center text-[#E76F51] mb-6 relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <BellRing size={32} className="animate-pulse" />
                  </motion.div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white animate-ping" />
                </div>

                <h3 className="text-2xl font-display font-bold text-[#2D2D2D] tracking-tight mb-2">
                  Steward Summoned!
                </h3>
                
                <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs mb-6">
                  Our service partner is making their way to <span className="font-bold text-[#2D2D2D] underline decoration-[#E76F51]">Table {tableNumber.toString().padStart(2, '0')}</span>, holding your draft items summary for customizations and kitchen routing.
                </p>

                {/* Simulated Real-Time Status Ticker card */}
                <div className="w-full bg-[#FFFDF8] border border-[#ECE7E1] rounded-2xl p-4 text-left space-y-2.5 mb-8 shadow-brilixis-sm">
                  <div className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
                    Tableside Pager Status
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6B7280]">Assigned Steward</span>
                    <span className="font-mono font-bold text-[#2D2D2D]" id="live-steward-name">
                      {waiterRequest?.waiterName || 'Table Host (En-route)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6B7280]">Estimated Wait Time</span>
                    <span className="font-mono font-bold text-[#E76F51]" id="live-steward-eta">
                      {waiterRequest?.etaString || '30 Seconds'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDismissConfirmation}
                  className="btn-primary w-full py-4 uppercase text-xs tracking-wider"
                  id="order-waiter-confirmed-ok"
                >
                  Return to Menu
                </button>
              </motion.div>
            ) : checkoutStep === 'details' ? (
              // STEP 6A: Diner Details form
              <form onSubmit={handleSendOtp} className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto no-scrollbar" id="checkout-details-form">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#2D2D2D] tracking-tight">
                      Tableside Verification
                    </h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed mt-1">
                      Provide contact and billing information below to authenticate OTP security and generate your custom GST invoice.
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-150 text-rose-700 text-[11px] rounded-xl flex items-center gap-2">
                      <AlertCircle size={13} className="flex-none" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold tracking-wider block mb-1.5">
                        Diner Name *
                      </label>
                      <div className="relative">
                        <User size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                        <input
                          type="text"
                          placeholder="Your Name (e.g. Aditya Darji)"
                          required
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          className="input-field pl-10 pr-4 py-3.5 text-xs font-display"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold tracking-wider block mb-1.5">
                        WhatsApp / Contact Number *
                      </label>
                      <div className="relative">
                        <Phone size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                        <input
                          type="tel"
                          placeholder="10-digit number (e.g. 9876543210)"
                          required
                          maxLength={10}
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, ''))}
                          className="input-field pl-10 pr-4 py-3.5 text-xs font-display"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold tracking-wider block mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                        <input
                          type="email"
                          placeholder="yourname@domain.com"
                          required
                          value={custEmail}
                          onChange={(e) => setCustEmail(e.target.value)}
                          className="input-field pl-10 pr-4 py-3.5 text-xs font-display"
                        />
                      </div>
                    </div>

                    {/* Business Billing Checkbox */}
                    <div className="pt-2 border-t border-[#ECE7E1]">
                      <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                        <input
                          type="checkbox"
                          checked={isBusiness}
                          onChange={(e) => setIsBusiness(e.target.checked)}
                          className="rounded text-[#E76F51] focus:ring-[#E76F51] h-3.5 w-3.5 accent-[#E76F51]"
                        />
                        <span className="text-[10px] font-mono font-bold text-[#2D2D2D] uppercase tracking-wider">
                          Claim Corporate GST (B2B Billing)
                        </span>
                      </label>
                    </div>

                    {isBusiness && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-1"
                      >
                        <div>
                          <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold tracking-wider block mb-1.5">
                            Company GSTIN *
                          </label>
                          <div className="relative">
                            <Building size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                            <input
                              type="text"
                              placeholder="15-character GSTIN (e.g. 27AAPCH1234F1Z5)"
                              maxLength={15}
                              required={isBusiness}
                              value={custGstin}
                              onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
                              className="input-field pl-10 pr-4 py-3.5 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold tracking-wider block mb-1.5">
                            Registered Company Name *
                          </label>
                          <div className="relative">
                            <Building size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                            <input
                              type="text"
                              placeholder="e.g. Acme Hospitality Pvt Ltd"
                              required={isBusiness}
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="input-field pl-10 pr-4 py-3.5 text-xs font-display"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ECE7E1] bg-white mt-4">
                  <button
                    type="submit"
                    className="btn-primary w-full py-4 uppercase text-xs tracking-wider flex justify-center items-center gap-2"
                  >
                    Authenticate with One-Time Pin <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart_view')}
                    className="w-full text-center text-[10px] font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#E76F51] mt-3.5 cursor-pointer"
                  >
                    Back to Summary
                  </button>
                </div>
              </form>
            ) : checkoutStep === 'otp' ? (
              // STEP 6B: OTP Code entry
              <form onSubmit={handleVerifyOtp} className="flex-1 flex flex-col justify-between p-6 bg-white" id="checkout-otp-form">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#2D2D2D] tracking-tight flex items-center gap-1.5">
                      <KeyRound size={16} className="text-[#E76F51]" /> SMS Verification PIN
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      A visual OTP was dispatched to your contact <span className="font-bold text-[#2D2D2D] font-mono">+91 {custPhone}</span>.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] rounded-xl font-mono leading-relaxed">
                    💡 <strong>TEST MODE PASSCODE:</strong> Enter any 4-digit code (e.g. <span className="underline font-bold">1234</span>) to authenticate.
                  </div>

                  {formError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] rounded-xl">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold tracking-wider block mb-1.5">
                      4-Digit Code
                    </label>
                    <input
                      type="text"
                      placeholder="••••"
                      required
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center font-mono text-xl font-black tracking-[0.5em] bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl py-3 placeholder-neutral-300 focus:outline-none focus:border-[#E76F51] text-[#2D2D2D]"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ECE7E1] bg-white">
                  <button
                    type="submit"
                    className="w-full bg-[#2D2D2D] hover:bg-black text-white py-4 rounded-2xl font-display font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer text-center shadow-brilixis-sm"
                  >
                    Confirm Verifier Pin
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('details')}
                    className="w-full text-center text-[10px] font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#E76F51] mt-3.5 cursor-pointer"
                  >
                    Back to Details
                  </button>
                </div>
              </form>
            ) : checkoutStep === 'payment' ? (
              // STEP 7: Select payment option and verify
              <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto no-scrollbar" id="checkout-payment-panel">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#2D2D2D] tracking-tight">
                      Gateway Settlement
                    </h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed mt-1">
                      Review complete tax invoice ledger items & select dynamic Indian billing channel.
                    </p>
                  </div>

                  {/* Gateway Amount Card */}
                  <div className="flex justify-between items-center bg-[#E76F51]/10 border border-[#E76F51]/20 rounded-2xl p-4 shadow-brilixis-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E76F51] animate-ping" />
                      <span className="text-xs font-display font-black text-[#2D2D2D]">Settle Grand Total</span>
                    </div>
                    <span className="font-mono text-base font-extrabold text-[#E76F51]">
                      ₹{Math.round(activeOrder?.total || 0)}
                    </span>
                  </div>

                  {/* Payment selectors */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <button
                      onClick={() => setPayMethod('upi')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        payMethod === 'upi'
                          ? 'border-[#E76F51] bg-[#E76F51]/10 text-[#E76F51] font-bold'
                          : 'border-[#ECE7E1] bg-[#FFFDF8] text-[#2D2D2D] hover:bg-white'
                      }`}
                    >
                      <Smartphone size={13} />
                      <span>UPI / QR</span>
                    </button>
                    <button
                      onClick={() => setPayMethod('card')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        payMethod === 'card'
                          ? 'border-[#E76F51] bg-[#E76F51]/10 text-[#E76F51] font-bold'
                          : 'border-[#ECE7E1] bg-[#FFFDF8] text-[#2D2D2D] hover:bg-white'
                      }`}
                    >
                      <CreditCard size={13} />
                      <span>Cards</span>
                    </button>
                    <button
                      onClick={() => setPayMethod('net')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        payMethod === 'net'
                          ? 'border-[#E76F51] bg-[#E76F51]/10 text-[#E76F51] font-bold'
                          : 'border-[#ECE7E1] bg-[#FFFDF8] text-[#2D2D2D] hover:bg-white'
                      }`}
                    >
                      <Sparkles size={11} />
                      <span>Netbanks</span>
                    </button>
                  </div>

                  {/* Channel specifics */}
                  <div className="p-4 bg-[#FFFDF8] border border-[#ECE7E1] rounded-2xl space-y-3 shadow-brilixis-sm">
                    {payMethod === 'upi' && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold block">Diners VPA Address</label>
                        <input
                          type="text"
                          placeholder="aditya@okaxis, or pay@upi..."
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="input-field px-3 py-2.5 text-xs font-mono"
                        />
                      </div>
                    )}
                    {payMethod === 'card' && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-[#6B7280] uppercase font-bold block">Secure Credit Card</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          className="input-field px-3 py-2 text-xs font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="MM/YY" className="input-field px-2 py-1.5 text-xs font-mono" />
                          <input type="password" placeholder="CVV" className="input-field px-2 py-1.5 text-xs font-mono" />
                        </div>
                      </div>
                    )}
                    {payMethod === 'net' && (
                      <div className="text-[11px] font-medium space-y-1.5 text-[#2D2D2D]">
                        {['State Bank of India', 'HDFC Bank Limited', 'ICICI Bank'].map((b) => (
                          <label key={b} className="flex items-center gap-2.5 p-1 rounded hover:bg-white cursor-pointer">
                            <input type="radio" name="bank_drawer_opt" defaultChecked={b.includes('HDFC')} className="accent-[#E76F51]" />
                            <span>{b}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ECE7E1] bg-white mt-4">
                  <button
                    onClick={handleSettlePayment}
                    disabled={isProcessingPayment}
                    className="btn-primary w-full py-4 uppercase text-xs tracking-wider flex justify-center items-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Settle Coins...</span>
                      </>
                    ) : (
                      <span>Settle Payment Securely 🔒</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('otp')}
                    className="w-full text-center text-[10px] font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#E76F51] mt-3.5 cursor-pointer"
                  >
                    Back to Verification
                  </button>
                </div>
              </div>
            ) : checkoutStep === 'invoice' ? (
              // STEP 8: Digital receipt stamp with PDF and whatsapp dispatch simulations
              <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto no-scrollbar" id="checkout-invoice-panel">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-2.5">
                      <CheckCircle size={24} />
                    </div>
                    <h3 className="text-lg font-display font-black text-[#2D2D2D] tracking-tight">
                      Order Settled & Paid!
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Dining receipt verified, tax-stamped & archived.
                    </p>
                  </div>

                  {/* POS Stamped Ticket Receipt */}
                  {paidOrder && (
                    <div className="relative border border-[#ECE7E1] bg-[#FFFDF8] p-4 rounded-2xl shadow-brilixis-sm text-[#2D2D2D] font-mono text-[9px] space-y-2.5">
                      <div className="absolute top-2.5 right-2.5 border-2 border-emerald-600/35 text-emerald-600 font-display font-bold px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-lg rotate-12 bg-white select-none">
                        PAID
                      </div>

                      <div className="text-center border-b border-dashed border-[#ECE7E1] pb-2">
                        <p className="font-display font-black text-[11px] uppercase tracking-wide">{restaurantGstProfile.restaurantName}</p>
                        <p className="text-[7px] text-[#6B7280]">GSTIN: {restaurantGstProfile.gstin}</p>
                        <p className="text-[6px] text-neutral-400">{restaurantGstProfile.address}</p>
                      </div>

                      <div className="space-y-0.5 border-b border-dashed border-[#ECE7E1] pb-2 text-[8px]">
                        <div className="flex justify-between font-bold text-neutral-800">
                          <span>INVOICE TYPE:</span>
                          <span className="text-[#E76F51]">{paidOrder.customerGstin ? 'B2B CORPORATE' : 'B2C RETAIL'}</span>
                        </div>
                        <p>Invoice No: <span className="font-bold">{paidOrder.invoiceNumber}</span></p>
                        <p>Diner: <span className="font-bold">{paidOrder.customerName}</span></p>
                        <p>Contact: <span className="font-bold">+91 {paidOrder.customerPhone}</span></p>
                        <p>Email: <span className="font-bold">{paidOrder.customerEmail}</span></p>
                        {paidOrder.customerGstin && (
                          <>
                            <p>Company: <span className="font-bold">{paidOrder.companyName}</span></p>
                            <p>GSTIN: <span className="font-bold">{paidOrder.customerGstin}</span></p>
                          </>
                        )}
                        <p>Table Assignment: <span className="font-bold">TBL-{tableNumber.toString().padStart(2, '0')}</span></p>
                      </div>

                      <div className="space-y-0.5 py-1 text-[8px] max-h-36 overflow-y-auto">
                        {paidOrder.items.map((it) => (
                          <div key={it.id} className="flex justify-between">
                            <span>{it.quantity}x {it.menuItem.name.substring(0,22)}</span>
                            <span>₹{(it.taxableValue || it.menuItem.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-dashed border-[#ECE7E1] pt-2 space-y-0.5 font-bold text-[8px]">
                        <div className="flex justify-between font-normal">
                          <span>Taxable Value</span>
                          <span>₹{(paidOrder.gstSummary?.totalTaxable || paidOrder.subtotal).toFixed(2)}</span>
                        </div>
                        {paidOrder.gstSummary?.isInterstate ? (
                          <div className="flex justify-between font-normal text-neutral-500">
                            <span>IGST Total</span>
                            <span>₹{paidOrder.gstSummary.igst.toFixed(2)}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between font-normal text-neutral-500">
                              <span>CGST Total</span>
                              <span>₹{(paidOrder.gstSummary?.cgst || paidOrder.tax / 2).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-normal text-neutral-500">
                              <span>SGST Total</span>
                              <span>₹{(paidOrder.gstSummary?.sgst || paidOrder.tax / 2).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {paidOrder.discount > 0 && (
                          <div className="flex justify-between font-normal text-[#E76F51]">
                            <span>Discount Applied</span>
                            <span>-₹{paidOrder.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-normal text-neutral-400">
                          <span>Round Off Adjustment</span>
                          <span>₹{paidOrder.gstSummary?.roundOff >= 0 ? '+' + paidOrder.gstSummary.roundOff.toFixed(2) : paidOrder.gstSummary?.roundOff.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-emerald-950 border-t border-[#2D2D2D] pt-1 mt-1 font-extrabold">
                          <span>GRAND TOTAL</span>
                          <span>₹{paidOrder.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="text-center text-[6px] text-neutral-400 pt-1.5 border-t border-dashed border-[#ECE7E1]">
                        Ref: {paidOrder.paymentDetails?.transactionId || 'pay_F93HDNWA92JD'}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp and PDF action triggers */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      onClick={() => handlePrintInvoice(paidOrder)}
                      className="btn-outline py-3 text-[9px] font-mono flex justify-center items-center gap-1.5"
                    >
                      <Download size={11} /> Print A4 Invoice
                    </button>
                    <button
                      onClick={() => alert(`Digital transaction B${paidOrder?.customerGstin ? '2B' : '2C'} GST tax invoice sent via WhatsApp messaging API to +91 ${custPhone}!`)}
                      className="py-3 bg-[#EEFDF5] border border-[#BFF3D3] rounded-xl font-mono text-[9px] font-extrabold text-emerald-800 flex justify-center items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Send size={11} /> WhatsApp Bill
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ECE7E1] bg-white mt-4">
                  <button
                    onClick={handleResetTableSession}
                    className="btn-primary w-full py-4 text-xs uppercase tracking-wider text-center"
                  >
                    Reset Table & Close Session
                  </button>
                </div>
              </div>
            ) : cart.length > 0 ? (
              // SCROLLABLE CART LISTINGS (STANDARD UN-SUBMITTED CART ITEMS)
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar bg-white" id="items-scroll-view">
                  <div className="bg-[#FFFDF8] rounded-2xl p-3 border border-[#ECE7E1] text-[11px] text-[#6B7280] leading-relaxed flex items-center gap-2 mb-2 shadow-brilixis-sm">
                    <span className="font-bold text-[#E76F51] text-xs">ℹ</span>
                    <span>Review items below. To request any edits or submit the order, tap the button at the bottom to notify your steward.</span>
                  </div>

                  {cart.map((item) => {
                    const itemExtrasPrice = item.addedIngredients.length * 50; // ₹50 each
                    const itemSingleTotal = item.menuItem.price + itemExtrasPrice;

                    return (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-white border border-[#ECE7E1] flex gap-4 pr-3.5 relative shadow-brilixis-sm"
                      >
                        {/* Food Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-none bg-[#FFFDF8] border border-[#ECE7E1]">
                          <img
                            src={item.menuItem.imageUrl}
                            alt={item.menuItem.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1 pb-1">
                            {/* Veg dot & Name */}
                            <div className="flex gap-2 items-center min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full flex-none border-2 border-white shadow-xs ${item.menuItem.isVeg ? 'bg-emerald-500' : 'bg-[#E76F51]'}`} />
                              <h4 className="text-xs font-display font-extrabold text-[#2D2D2D] truncate leading-tight">
                                {item.menuItem.name}
                              </h4>
                            </div>

                            {/* Delete Trigger */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 rounded-md text-[#6B7280] hover:text-[#E76F51] hover:bg-[#E76F51]/5 transition-colors cursor-pointer ml-1"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Ingredient modifications */}
                          {(item.excludedIngredients.length > 0 || item.addedIngredients.length > 0) && (
                            <div className="space-y-0.5 mt-1" id="customizations-listing">
                              {/* Exclusions */}
                              {item.excludedIngredients.map((ex) => (
                                <div key={ex} className="text-[9px] font-mono text-[#6B7280] flex items-center gap-1 leading-none line-through decoration-[#E76F51]/50">
                                  <span className="text-[#E76F51]">✕</span> Hold {ex}
                                </div>
                              ))}
                              {/* Adds */}
                              {item.addedIngredients.map((ad) => (
                                <div key={ad} className="text-[9px] font-mono text-emerald-800 flex items-center gap-1 leading-none">
                                  <span className="text-emerald-500">✓</span> Extra {ad} (₹50)
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Additional Chef Instructions */}
                          {item.customInstructions.trim() && (
                            <div className="bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl p-2 mt-2">
                              <span className="text-[8px] font-mono font-bold text-[#6B7280]">NOTES FOR CHEF:</span>
                              <p className="text-[9px] text-[#2D2D2D] leading-snug italic">
                                "{item.customInstructions.trim()}"
                              </p>
                            </div>
                          )}

                          {/* Stepper controls */}
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#ECE7E1]">
                            <div className="flex items-center bg-white border border-[#ECE7E1] rounded-xl p-1">
                              <button
                                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-[#6B7280] hover:text-[#E76F51] transition-colors cursor-pointer"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="px-2 min-w-[1.5rem] text-center font-mono font-bold text-[#2D2D2D] text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-[#6B7280] hover:text-[#E76F51] transition-colors cursor-pointer"
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            {/* Subtotal Item Price */}
                            <div className="font-mono text-xs text-[#2D2D2D] font-bold">
                              ₹{itemSingleTotal * item.quantity}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* BOTTOM FIXED Segment: Summon steward to approve and route draft order */}
                <div className="p-6 bg-white border-t border-[#ECE7E1]" id="cart-billing-footer">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-xs text-[#6B7280]">
                      <span>Dining Subtotal</span>
                      <span className="font-mono text-[#2D2D2D]">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-[#6B7280]">
                      <span>GST & Hospitality Fee (18%)</span>
                      <span className="font-mono text-[#2D2D2D]">₹{Math.round(taxAndService)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2.5 border-t border-[#ECE7E1]">
                      <span className="text-sm font-display font-extrabold text-[#2D2D2D]">Total Amount</span>
                      <span className="text-lg font-mono font-black text-[#E76F51]">
                        ₹{Math.round(grandTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCallWaiterForOrder}
                    className="btn-primary w-full py-4 px-6 uppercase text-xs tracking-wider flex items-center justify-center gap-2"
                    id="place-order-cta"
                  >
                    <BellRing size={14} className="animate-bounce" />
                    Call Steward to Place Order
                  </button>
                </div>
              </>
            ) : activeOrder ? (
              // IF CART IS EMPTY BUT HAS AN ACTIVE BILL OR TRACKING ORDER
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar bg-white" id="items-scroll-view">
                  {/* Status Header Banner */}
                  <div className="p-4 rounded-2xl border flex items-start gap-3 transition-colors bg-[#FFFDF8] border-[#ECE7E1] shadow-brilixis-sm">
                    <span className="p-2 rounded-xl bg-[#E76F51]/10 text-[#E76F51] mt-0.5">
                      <Receipt size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <p className="text-xs font-display font-black text-[#2D2D2D] uppercase tracking-wider">
                            Active Dine-in Order
                          </p>
                          <p className="text-[10px] text-[#6B7280] mt-0.5 font-mono leading-none">
                            Ref Token: {activeOrder.id}
                          </p>
                        </div>
                        
                        <span className={`inline-block text-[8px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase ${
                          activeOrder.status === 'draft_submitted' ? 'bg-amber-100 text-amber-800' :
                          activeOrder.status === 'sent_to_kitchen' || activeOrder.status === 'preparing' ? 'bg-[#E76F51]/10 text-[#E76F51] animate-pulse' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {activeOrder.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Visual Stepper Tracker */}
                      <div className="mt-4 pt-4 border-t border-[#ECE7E1]">
                        <div className="flex justify-between items-center relative">
                          {/* Stepper horizontal track line */}
                          <div className="absolute top-3.5 left-5 right-5 h-0.5 bg-neutral-200 z-0" />
                          <div 
                            className="absolute top-3.5 left-5 h-0.5 bg-[#E76F51] transition-all duration-500 z-0" 
                            style={{ 
                              width: activeOrder.status === 'draft_submitted' ? '0%' :
                                     activeOrder.status === 'sent_to_kitchen' ? '33%' :
                                     ['preparing', 'ready'].includes(activeOrder.status) ? '66%' : '100%'
                            }} 
                          />

                          {/* Steps */}
                          {[
                            { label: 'Placed', key: 'placed', icon: '🛎️', active: true },
                            { label: 'Approved', key: 'approved', icon: '📋', active: ['sent_to_kitchen', 'preparing', 'ready', 'served', 'bill_requested', 'paid'].includes(activeOrder.status) },
                            { label: 'Cooking', key: 'cooking', icon: '🍳', active: ['preparing', 'ready', 'served', 'bill_requested', 'paid'].includes(activeOrder.status) },
                            { label: 'Served', key: 'served', icon: '🍽️', active: ['served', 'bill_requested', 'paid'].includes(activeOrder.status) }
                          ].map((step) => (
                            <div key={step.key} className="flex flex-col items-center z-10 relative">
                              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] border transition-all ${
                                step.active 
                                  ? 'bg-[#E76F51] text-white border-[#E76F51] shadow-xs font-bold scale-105' 
                                  : 'bg-white text-zinc-400 border-zinc-200'
                              }`}>
                                {step.active ? '✓' : step.icon}
                              </div>
                              <span className={`text-[8px] font-mono uppercase font-black tracking-tighter mt-1 ${
                                step.active ? 'text-[#E76F51]' : 'text-zinc-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* List items representing active unpaid dishes */}
                  {activeOrder.items.map((item) => {
                    const itemExtrasPrice = item.addedIngredients.length * 50; // ₹50 each
                    const itemSingleTotal = item.menuItem.price + itemExtrasPrice;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white border border-[#ECE7E1] flex gap-4 pr-3.5 relative shadow-brilixis-sm"
                      >
                        {/* Food Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-none bg-[#FFFDF8] border border-[#ECE7E1]">
                          <img
                            src={item.menuItem.imageUrl}
                            alt={item.menuItem.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1 pb-1">
                            <div className="flex gap-2 items-center min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full flex-none border-2 border-white shadow-xs ${item.menuItem.isVeg ? 'bg-emerald-500' : 'bg-[#E76F51]'}`} />
                              <h4 className="text-xs font-display font-extrabold text-[#2D2D2D] truncate leading-tight">
                                {item.menuItem.name}
                              </h4>
                            </div>
                          </div>

                          {/* Ingredient edits */}
                          {(item.excludedIngredients.length > 0 || item.addedIngredients.length > 0) && (
                            <div className="space-y-0.5 mt-1">
                              {item.excludedIngredients.map((ex) => (
                                <div key={ex} className="text-[9px] font-mono text-[#6B7280] flex items-center gap-1 line-through">
                                  <span className="text-[#E76F51]">✕</span> hold {ex}
                                </div>
                              ))}
                              {item.addedIngredients.map((ad) => (
                                <div key={ad} className="text-[9px] font-mono text-emerald-800 flex items-center gap-1">
                                  <span className="text-emerald-500">✓</span> Extra {ad} (₹50)
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Instructions remarks */}
                          {item.customInstructions.trim() && (
                            <div className="bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl p-2 mt-2">
                              <span className="text-[8px] font-mono font-bold text-[#6B7280]">NOTES FOR CHEF:</span>
                              <p className="text-[9px] text-[#2D2D2D] leading-snug italic">
                                "{item.customInstructions.trim()}"
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#ECE7E1]">
                            <span className="font-mono text-xs text-[#6B7280]">
                              Qty: <span className="font-extrabold text-[#2D2D2D]">{item.quantity}</span>
                            </span>
                            <div className="font-mono text-xs text-[#2D2D2D] font-bold">
                              ₹{itemSingleTotal * item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM COMPLIANCE CONTROL BANNER (DYNAMIC OR PAYMENT LOCK) */}
                {['ready', 'served', 'bill_requested'].includes(activeOrder.status) ? (
                  // Step 5: After served, waiter closes (delivered), customer gets payment option!
                  <div className="p-6 bg-white border-t border-[#ECE7E1]" id="cart-checkout-prompt-footer">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-xs text-[#6B7280]">
                        <span>Dine Base Receipt</span>
                        <span className="font-mono text-[#2D2D2D]">₹{activeOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#6B7280]">
                        <span>CGST & SGST Compliance (18%)</span>
                        <span className="font-mono text-[#2D2D2D]">₹{Math.round(activeOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#ECE7E1]">
                        <span className="text-sm font-display font-extrabold text-[#2D2D2D]">Grand Total Settle Balance</span>
                        <span className="text-lg font-mono font-black text-[#E76F51]">
                          ₹{Math.round(activeOrder.total)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5 mb-4 text-emerald-800">
                      <CheckCircle size={14} className="flex-none mt-0.5 text-emerald-600" />
                      <div className="text-[10px] leading-relaxed">
                        <span className="font-bold block">Feast Served Perfectly!</span>
                        Your specialties are table-served. Proceed below to authenticate and initiate checkout.
                      </div>
                    </div>

                    <button
                      onClick={startCheckout}
                      className="btn-primary w-full py-4 px-6 uppercase text-xs tracking-wider flex justify-center items-center gap-1.5"
                      id="proceed-to-payment-btn"
                    >
                      💳 Settle Bill & Pay Now
                    </button>
                  </div>
                ) : (
                  // Under preparation / Cooking status, Settle Payment is locked
                  <div className="p-6 bg-white border-t border-[#ECE7E1]" id="cart-cooking-locked-footer">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm font-display font-bold text-[#2D2D2D]">
                        <span>Bill Amount Pending</span>
                        <span className="font-mono text-[#E76F51]">₹{Math.round(activeOrder.total)}</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#FFFDF8] border border-[#ECE7E1] rounded-2xl flex items-start gap-2.5 mb-3 shadow-brilixis-sm">
                      <span className="w-2 h-2 rounded-full bg-[#E76F51] mt-1.5 animate-pulse flex-none" />
                      <div className="text-[10px] text-[#6B7280] leading-relaxed">
                        <span className="font-bold text-[#2D2D2D] block">Recipe Preparing In Kitchen</span>
                        Your delicacies are currently being prepped. Once served, your secure Razorpay checkout terminal will unlock inside this cart.
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 text-slate-400 py-4 px-6 rounded-2xl font-display font-bold text-xs tracking-wider uppercase cursor-not-allowed"
                    >
                      Cooking In Progress...
                    </button>
                  </div>
                )}
              </>
            ) : (
              // ABSOLUTELY VACANT TABLE AND EMPTY CART VIEW
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white" id="empty-cart-view">
                <div className="w-16 h-16 rounded-full bg-[#FFFDF8] border border-[#ECE7E1] flex items-center justify-center text-[#6B7280] mb-4 shadow-brilixis-sm">
                  <UtensilsCrossed size={20} />
                </div>
                <h3 className="text-base font-display font-bold text-[#2D2D2D] mb-1 leading-none">
                  Cart is currently empty
                </h3>
                <p className="text-xs text-[#6B7280] max-w-[220px] leading-relaxed mb-6">
                  Add delicious dishes to experience an interactive dining & billing journey.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-outline px-6 py-3 rounded-2xl text-xs font-bold"
                  id="empty-close-drawer"
                >
                  Explore Specialties
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
