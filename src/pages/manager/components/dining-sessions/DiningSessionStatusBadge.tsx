import type { DiningSessionStatus } from "@/src/services/dining_session.service";

interface DiningSessionStatusBadgeProps {
  status: DiningSessionStatus;
}

const statusStyles: Record<
  DiningSessionStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  closed: {
    label: "Closed",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export default function DiningSessionStatusBadge({
  status,
}: DiningSessionStatusBadgeProps) {
  const config = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
