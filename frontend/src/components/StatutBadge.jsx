import { CircleDot, Clock, CircleCheck } from "lucide-react";

const CONFIG = {
  EN_COURS: { label: "En cours", color: "text-mae-teal", bg: "bg-mae-teal/10", icon: CircleDot },
  A_VENIR: { label: "À venir", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  TERMINE: { label: "Terminé", color: "text-slate-500", bg: "bg-slate-100", icon: CircleCheck },
};

export default function StatutBadge({ statut }) {
  const config = CONFIG[statut] ?? CONFIG.A_VENIR;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}