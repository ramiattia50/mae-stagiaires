import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, ClipboardCheck, Building2, X } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/candidatures", label: "Candidatures", icon: FileText },
  { to: "/stagiaires", label: "Stagiaires", icon: Users },
  { to: "/evaluations", label: "Evaluations", icon: ClipboardCheck },
  { to: "/departements", label: "Departements", icon: Building2 },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 flex flex-col py-6 transform transition-transform duration-300 ease-out
          bg-gradient-to-b from-mae-blue to-[#082B47] text-white
          lg:static lg:translate-x-0 lg:w-64
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 pb-7 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-display font-bold text-sm text-mae-blue">MAE</span>
            </div>
            <div>
              <p className="font-display font-bold text-[15px] leading-tight">MAE Assurances</p>
              <p className="text-[11px] text-blue-200/80">Pole Richesse Humaine</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-blue-200 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-5 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white font-medium shadow-inner"
                    : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
