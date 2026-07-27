import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, ClipboardCheck, Building2 } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/candidatures", label: "Candidatures", icon: FileText },
  { to: "/stagiaires", label: "Stagiaires", icon: Users },
  { to: "/evaluations", label: "Évaluations", icon: ClipboardCheck },
  { to: "/departements", label: "Départements", icon: Building2 },
];

export default function Sidebar() {
  return (
    <aside className="w-[230px] shrink-0 bg-mae-blue text-white flex flex-col py-6">
      <div className="flex items-center gap-2.5 px-5 pb-7 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-sm text-mae-blue">MAE</span>
        </div>
        <div>
          <p className="font-display font-bold text-[15px] leading-tight">MAE Assurances</p>
          <p className="text-[11px] text-blue-200">Pôle Richesse Humaine</p>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm border-l-[3px] transition-colors ${
                isActive
                  ? "bg-mae-teal/20 border-mae-teal text-white font-medium"
                  : "border-transparent text-blue-100/80 hover:text-white"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}