import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BellRing, CheckCircle2, Loader2, X, User } from "lucide-react";
import { WaiterRequest } from "../../../types/types";
import {
  cancelWaiterRequest,
  triggerCallWaiter,
} from "@/src/services/waiter_request.service";

interface WaiterSummonerProps {
  tableNumber: string;
  setAllWaiterRequest: React.Dispatch<any>;
  waiterRequest: WaiterRequest | null;
  setWaiterRequest: React.Dispatch<any>;
}

export const WaiterSummoner: React.FC<WaiterSummonerProps> = ({
  tableNumber,
  setAllWaiterRequest,
  waiterRequest,
  setWaiterRequest,
}) => {
  const [, setSelectedType] = useState<WaiterRequest["type"]>("general");

  const CALL_OPTIONS = [
    {
      type: "general",
      label: "Call Waiter",
      desc: "General help or table service",
      icon: "🛎️",
    },
    {
      type: "water",
      label: "Request Water",
      desc: "Refill clean water carafe",
      icon: "🥛",
    },
    {
      type: "tissue",
      label: "Request Tissue",
      desc: "Sanitizing dry wipes",
      icon: "🧻",
    },
    {
      type: "cutlery",
      label: "Request Cutlery",
      desc: "Forks, spoons or tableware",
      icon: "🍽️",
    },
    {
      type: "cleaning",
      label: "Request Cleaning",
      desc: "Table wiping or clearing",
      icon: "🧹",
    },
    {
      type: "bill",
      label: "Request Bill",
      desc: "Initiate tableside checkout",
      icon: "💳",
    },
  ] as const;

  const handleSummon = (type: WaiterRequest["type"], label: string) => {
    setSelectedType(type);
    triggerCallWaiter(type, label, tableNumber, setAllWaiterRequest);
  };

  return (
    <div className="card-surface p-6 mb-8 relative" id="waiter-summoner-card">
      {/* Background radial accent */}
      {waiterRequest && (
        <div className="absolute inset-x-0 -top-24 h-48 bg-[#E76F51]/5 blur-3xl rounded-full" />
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-3 rounded-2xl ${waiterRequest ? "bg-[#E76F51]/10 text-[#E76F51]" : "bg-[#FFFDF8] text-[#6B7280]"} border border-[#ECE7E1] transition-colors`}
        >
          <BellRing
            size={20}
            className={waiterRequest ? "animate-pulse" : ""}
          />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-[#2D2D2D] tracking-tight leading-none mb-1">
            Table Steward Pager
          </h2>
          <p className="text-[10px] uppercase font-mono font-bold text-[#6B7280]">
            Assigned to Table {tableNumber.toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!waiterRequest ? (
          /* Selection Interface */
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-xs text-[#6B7280] leading-relaxed mb-3">
              Need assistance? Select a quick service request below, and a
              dining steward will visit your table shortly.
            </p>

            <div
              className="grid grid-cols-2 gap-2.5"
              id="summoner-options-grid"
            >
              {CALL_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleSummon(opt.type, opt.label)}
                  className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#ECE7E1] hover:border-[#E76F51]/40 hover:bg-white text-left transition-all group cursor-pointer hover:shadow-brilixis-sm"
                  id={`summon-btn-${opt.type}`}
                >
                  <div className="text-xl mb-2 group-hover:scale-110 transition-transform origin-left">
                    {opt.icon}
                  </div>
                  <h4 className="text-xs font-display font-bold text-[#2D2D2D] tracking-tight group-hover:text-[#E76F51] transition-colors">
                    {opt.label}
                  </h4>
                  <p className="text-[10px] text-[#6B7280] leading-tight mt-1 line-clamp-1">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Live Timeline Tracker */
          <motion.div
            key="tracker"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E76F51]/20"
            id="waiter-tracker-card"
          >
            {/* Active service card layout */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/20 px-2.5 py-0.5 rounded-full inline-block">
                  {waiterRequest.label}
                </span>
                <h3 className="text-sm font-display font-bold text-[#2D2D2D] mt-1.5 leading-none">
                  Calling Table Host...
                </h3>
              </div>

              <button
                onClick={() =>
                  cancelWaiterRequest(
                    tableNumber,
                    setAllWaiterRequest,
                    setWaiterRequest,
                  )
                }
                className="btn-icon p-1.5 rounded-full"
                title="Cancel Service Call"
                id="cancel-summon"
              >
                <X size={12} />
              </button>
            </div>

            {/* Simulated Live Timeline Steps */}
            <div
              className="space-y-4 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#ECE7E1]"
              id="summon-timeline"
            >
              {/* Point 1: Request Transmitted */}
              <div className="relative">
                <span className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-[#2A9D8F] ring-4 ring-[#2A9D8F]/10" />
                <div className="leading-tight">
                  <p className="text-xs font-bold text-[#2D2D2D]">
                    Request Dispatched
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    Table {tableNumber.toString().padStart(2, "0")} service
                    beacon is active
                  </p>
                </div>
              </div>

              {/* Point 2: Waiter Assigned */}
              {["assigned", "on_the_way", "resolved"].includes(
                waiterRequest.status,
              ) ? (
                <div className="relative">
                  <span className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-[#2A9D8F] ring-4 ring-[#2A9D8F]/10" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-[#2D2D2D] flex items-center gap-1">
                      <span>Assigned to {waiterRequest.waiterName}</span>
                      <User size={10} className="text-[#E76F51]" />
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Dining staff partner has been assigned
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-[#ECE7E1]" />
                  <div className="leading-tight opacity-50">
                    <p className="text-xs font-medium text-[#2D2D2D] flex items-center gap-1">
                      <span>Assigning Steward...</span>
                      <Loader2
                        size={10}
                        className="animate-spin text-[#E76F51]"
                      />
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Locating nearest available staff partner
                    </p>
                  </div>
                </div>
              )}

              {/* Point 3: On The Way */}
              {["on_the_way", "resolved"].includes(waiterRequest.status) ? (
                <div className="relative">
                  <span className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-[#2A9D8F] ring-4 ring-[#2A9D8F]/10" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-[#2D2D2D]">
                      Steward en-route
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      ETA: {waiterRequest.etaString || "30 sec"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-[#ECE7E1]" />
                  <div className="leading-tight opacity-50">
                    <p className="text-xs font-medium text-[#2D2D2D]">
                      Arriving Soon
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Steward moving to Table {tableNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* Point 4: Completed / Resolved */}
              {waiterRequest.status === "resolved" ? (
                <div className="relative">
                  <span className="absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#E76F51] ring-4 ring-[#E76F51]/15 border border-white animate-bounce" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-[#E76F51] flex items-center gap-1">
                      <span>Steward Arrived</span>
                      <CheckCircle2 size={11} className="text-[#E76F51]" />
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Steward is at your tableside.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Prompt dismiss option when completed */}
            {waiterRequest.status === "resolved" && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() =>
                  cancelWaiterRequest(
                    tableNumber,
                    setAllWaiterRequest,
                    setWaiterRequest,
                  )
                }
                className="btn-outline mt-4 w-full py-2 text-xs text-center"
                id="dismiss-resolved-call"
              >
                Clear Notification Pager
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
