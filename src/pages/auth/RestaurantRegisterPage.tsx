import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MailCheck,
  ShieldAlert,
  FileText,
  MapPin,
  Users,
} from "lucide-react";
import {
  RestaurantRegisterPayload,
  INDIAN_STATES,
} from "../../types/AuthTypes";
import { AuthService } from "../../services/auth.service";
import { useRestaurant } from "@/src/context/RestaurantContext";
import { useNavigate } from "react-router-dom";

// ⚠️ THIS REGISTER FORM IS FOR RESTAURANT AND MERCHANT OWNERS WHO WANTS TO REGISTER THERE BUSINESS

export const RestaurantRegisterPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<RestaurantRegisterPayload>({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    gstNumber: "",
    fssaiNumber: "",
    address: "",
    city: "",
    state: "Maharashtra",
    stateCode: "27",
    pincode: "",
    country: "India",
    employeeRange: "1-5",
    totalTables: 12,
    cuisineType: "Multi-Cuisine / Fine Dining",
    invoicePrefix: "INV-2026",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { updateRestaurantGstProfile } = useRestaurant();

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "state") {
      const selectedStateObj = INDIAN_STATES.find((s) => s.name === value);
      setFormData((prev) => ({
        ...prev,
        state: value,
        stateCode: selectedStateObj ? selectedStateObj.code : "27",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "totalTables"
            ? Math.max(1, parseInt(value, 10) || 1)
            : value,
      }));
    }
  };

  const validateCurrentStep = (): boolean => {
    setErrorMessage("");
    if (currentStep === 1) {
      if (!formData.restaurantName.trim()) {
        setErrorMessage("Please enter your Restaurant Name.");
        return false;
      }
      if (!formData.ownerName.trim()) {
        setErrorMessage("Please enter the Owner / Proprietor Name.");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setErrorMessage("Please enter a valid Business Email Address.");
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMessage("Please enter a valid Contact Phone Number.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.city.trim()) {
        setErrorMessage("Please specify your City.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
    }
  };

  const handlePrevStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strictly ensure registration only occurs on the final step
    if (currentStep < totalSteps) {
      handleNextStep();
      return;
    }

    if (!validateCurrentStep()) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await AuthService.registerRestaurant(formData);

      if (response.success) {
        setSuccessMessage(
          response.message ||
            `Registration submitted! Login credentials & terminal PINs will be issued to ${formData.email}.`,
        );
        setTimeout(() => {
          const payload = formData;
          updateRestaurantGstProfile({
            restaurantName: payload.restaurantName,
            legalBusinessName: payload.ownerName,
            gstin: payload.gstNumber || "27AAPCH1234F1Z5",
            fssaiNumber: payload.fssaiNumber || "11521001000123",
            address: payload.address,
            state: payload.state,
            stateCode: payload.stateCode || "27",
            pincode: payload.pincode,
            phoneNumber: payload.phone,
            email: payload.email,
            invoicePrefix: payload.invoicePrefix || "INV-2026",
            financialYear: "2026-27",
            taxConfig: "BOTH",
          });
          setTimeout(() => {
            return navigate("/auth/login");
          }, 2000);
        }, 2200);
      } else {
        setErrorMessage(response.message || "Registration failed.");
      }
    } catch (err) {
      setErrorMessage("Network / Server error during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsInfo = [
    { num: 1, label: "Identity", icon: Sparkles },
    { num: 2, label: "Statutory", icon: FileText },
    { num: 3, label: "Premises", icon: MapPin },
    { num: 4, label: "Capacity", icon: Users },
  ];

  return (
    // subtle ambient glow and brand heading Wrapper Container
    <div
      className="min-h-[85vh] flex flex-col items-center justify-start p-2 sm:p-6"
      id="login-container"
    >
      <div
        className="max-w-xl w-full bg-white rounded-3xl border border-[#E8E4DA] p-1.5 sm:p-8 shadow-xl relative overflow-hidden"
        id="login-panel"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#E76F51]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E76F51] to-[#F4A261] flex items-center justify-center font-display font-black text-white text-2xl mx-auto shadow-md mb-3">
            B
          </div>
          <span className="text-[11px] font-mono tracking-widest text-[#E76F51] font-bold uppercase block">
            Brilixis Dining OS • Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#1F2226] tracking-tight mt-1 leading-tight">
            Restaurant Business Onboarding
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6168] mt-1 max-w-md mx-auto">
            Complete food business registration to activate digital tableside
            ordering & GST billing
          </p>
        </div>

        {/* onboarding container */}
        <div className="space-y-6 text-left" id="restaurant-register-wizard">
          {/* Onboarding Wizard Stepper Header */}
          <div className="bg-[#FAF8F5] border border-[#E8E4DA] p-3.5 sm:p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E76F51]">
                Step {currentStep} of {totalSteps} • Business Onboarding
              </span>
              <span className="text-xs font-display font-extrabold text-[#2D2D2D]">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#E8E4DA] h-2 rounded-full overflow-hidden mb-3.5">
              <div
                className="bg-[#E76F51] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step Badges Grid */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {stepsInfo.map((s) => {
                const Icon = s.icon;
                const isCompleted = currentStep > s.num;
                const isCurrent = currentStep === s.num;

                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num < currentStep) setCurrentStep(s.num);
                    }}
                    disabled={s.num > currentStep}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                      isCurrent
                        ? "bg-white text-[#E76F51] border border-[#E76F51]/30 shadow-xs font-bold"
                        : isCompleted
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer font-bold"
                          : "bg-transparent text-neutral-400 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <CheckCircle2
                          size={13}
                          className="text-emerald-600 shrink-0"
                        />
                      ) : (
                        <Icon
                          size={13}
                          className={
                            isCurrent ? "text-[#E76F51]" : "text-neutral-400"
                          }
                        />
                      )}
                      <span className="text-[10px] sm:text-xs font-display truncate">
                        {s.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification Notice */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-start gap-2.5">
            <MailCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Enterprise Verification:</strong> Fill out your restaurant
              profile below. Credentials and staff PINs will be dispatched to
              your registered email upon approval.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono font-bold flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl leading-relaxed flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="text-emerald-600 shrink-0 mt-0.5"
              />
              <div>
                <strong className="font-bold text-emerald-900 text-xs block mb-0.5">
                  Registration Submitted Successfully!
                </strong>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: Identity & Owner Contact */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-xs font-mono font-bold text-[#71717A] uppercase tracking-wider border-b border-[#ECE7E1] pb-1.5 flex items-center gap-2">
                  <Sparkles size={15} className="text-[#E76F51]" />
                  <span>Step 1: Restaurant Identity & Owner Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      name="restaurantName"
                      required
                      placeholder="e.g. Royal Spice & Lounge"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm bg-white"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      Owner / Proprietor Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      Business Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="owner@restaurant.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm font-mono bg-white"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm font-mono bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Statutory & Tax Licenses */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-xs font-mono font-bold text-[#71717A] uppercase tracking-wider border-b border-[#ECE7E1] pb-1.5 flex items-center gap-2">
                  <FileText size={15} className="text-[#E76F51]" />
                  <span>Step 2: GSTIN & Statutory Licenses</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      GSTIN (GST Number)
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      placeholder="e.g. 27AAPCH1234F1Z5"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm font-mono uppercase bg-white"
                      disabled={isSubmitting}
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Optional for composition / exempt sellers
                    </span>
                  </div>

                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      FSSAI Food License Number
                    </label>
                    <input
                      type="text"
                      name="fssaiNumber"
                      placeholder="e.g. 11521001000123"
                      value={formData.fssaiNumber}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm font-mono bg-white"
                      disabled={isSubmitting}
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      14-Digit FSSAI License Number
                    </span>
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs font-semibold block mb-1">
                    Tax Invoice Prefix
                  </label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    placeholder="INV-2026"
                    value={formData.invoicePrefix}
                    onChange={handleChange}
                    className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm font-mono uppercase bg-white"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Location & Address */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-xs font-mono font-bold text-[#71717A] uppercase tracking-wider border-b border-[#ECE7E1] pb-1.5 flex items-center gap-2">
                  <MapPin size={15} className="text-[#E76F51]" />
                  <span>Step 3: Premises Location Address</span>
                </h4>

                <div>
                  <label className="form-label text-xs font-semibold block mb-1">
                    Street Address & Landmark
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. Shop 4-5, Phoenix Mall, Lower Parel"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm bg-white"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm bg-white"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="400013"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm font-mono bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* State Select Dropdown (Full width for clean mobile layout without text truncation) */}
                <div>
                  <label className="form-label text-xs font-semibold block mb-1">
                    State & GST Code *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm bg-white font-sans cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name} (Code: {st.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 4: Capacity & Scale */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-xs font-mono font-bold text-[#71717A] uppercase tracking-wider border-b border-[#ECE7E1] pb-1.5 flex items-center gap-2">
                  <Users size={15} className="text-[#E76F51]" />
                  <span>Step 4: Operational Scale & Capacity</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      Employee Staff Range *
                    </label>
                    <select
                      name="employeeRange"
                      value={formData.employeeRange}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm bg-white font-sans cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="1-5">1 - 5</option>
                      <option value="6-15">6 - 15</option>
                      <option value="16-30">16 - 30</option>
                      <option value="31-50">31 - 50</option>
                      <option value="50+">50+</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label text-xs font-semibold block mb-1">
                      Total Tables *
                    </label>
                    <input
                      type="number"
                      name="totalTables"
                      min={1}
                      max={100}
                      value={formData.totalTables}
                      onChange={handleChange}
                      className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm font-mono bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs font-semibold block mb-1">
                    Restaurant Type
                  </label>
                  <input
                    type="text"
                    name="cuisineType"
                    placeholder="e.g. Fine Dining / Cafe / Rooftop Lounge"
                    value={formData.cuisineType}
                    onChange={handleChange}
                    className="input-field w-full min-h-[48px] px-3.5 text-xs sm:text-sm bg-white"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Wizard Navigation Controls (Full width buttons with flex-wrap prevention) */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="min-h-[48px] px-4 py-3 bg-white border border-[#E8E4DA] hover:bg-[#FAF8F5] text-[#2D2D2D] font-display font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    key={`btn-step-next-${currentStep}`}
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 min-h-[48px] px-4 py-3 bg-[#E76F51] hover:bg-[#D65D3F] text-white font-display font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all whitespace-nowrap"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    key="btn-step-submit-final"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 min-h-[48px] px-4 py-3 bg-[#E76F51] hover:bg-[#D65D3F] text-white font-display font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Submitting Onboarding...</span>
                      </>
                    ) : (
                      <>
                        <Building2 size={18} />
                        <span>Submit Business Onboarding Request</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="w-full text-center text-xs font-display font-bold text-[#71717A] hover:text-[#E76F51] transition-colors flex items-center justify-center gap-1.5 py-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Already have account credentials? Sign In
              </button>
            </div>
          </form>
        </div>

        {/* end of ambient glow and business header wrapper container */}
      </div>
    </div>
  );
};
