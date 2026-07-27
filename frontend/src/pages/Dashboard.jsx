import { Search, Bell, ChevronDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import StatutBadge from "../components/StatutBadge";

const DEPARTMENT_DATA = [
  { name: "IT", stagiaires: 14 },
  { name: "Finance", stagiaires: 6 },
  { name: "RH", stagiaires: 4 },
  { name: "Marketing", stagiaires: 8 },
];

const TYPE_STAGE_DATA = [
  { name: "PFE", value: 18, color: "#0B3D62" },
  { name: "Stage d'été", value: 15, color: "#2D8577" },
  { name: "Observation", value: 6, color: "#D97706" },
];

const RECENT_STAGIAIRES = [
  { nom: "Ines Bouzid", dept: "IT", tuteur: "Karim Ferjani", debut: "01/07/2026", statut: "EN_COURS" },
  { nom: "Youssef Mansour", dept: "Finance", tuteur: "Sonia Chaabane", debut: "15/07/2026", statut: "EN_COURS" },
  { nom: "Rania Trabelsi", dept: "Marketing", tuteur: "Amine Bel Haj", debut: "05/08/2026", statut: "A_VENIR" },
];

function KpiCard({ label, value, sublabel }) {
  return (
    <div className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-xl px-5 py-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-display text-3xl font-bold text-mae-blue mt-1.5">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <main className="flex-1 px-8 py-7 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-[22px] font-bold text-mae-blue">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vue d'ensemble des stages</p>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-56">
            <Search size={15} className="text-slate-400" />
            <span className="text-sm text-slate-400">Rechercher...</span>
          </div>
          <button className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
            <Bell size={16} className="text-slate-500" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-mae-teal text-white flex items-center justify-center text-xs font-semibold font-display">
              RH
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <KpiCard label="Stagiaires actifs" value="43" sublabel="En cours" />
        <KpiCard label="Candidatures en attente" value="17" sublabel="À traiter" />
        <KpiCard label="Stages à venir" value="9" sublabel="Prochainement" />
        <KpiCard label="Évaluations en attente" value="5" sublabel="Validation RH" />
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-[1.4] bg-white border border-slate-200 rounded-xl px-5 py-5">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Stagiaires par département</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={DEPARTMENT_DATA} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
              <Bar dataKey="stagiaires" fill="#2D8577" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-5">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Répartition par type de stage</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={TYPE_STAGE_DATA} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={2}>
                {TYPE_STAGE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
        <div className="flex justify-between items-center mb-3.5">
          <p className="font-display text-sm font-semibold text-mae-blue">Stagiaires récents</p>
          <button className="text-xs text-mae-teal font-medium">Voir tout →</button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Nom", "Département", "Tuteur", "Début", "Statut"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_STAGIAIRES.map((s, i) => (
              <tr key={i}>
                <td className="px-2.5 py-2.5 text-sm text-mae-blue font-medium border-b border-slate-50">{s.nom}</td>
                <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{s.dept}</td>
                <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{s.tuteur}</td>
                <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{s.debut}</td>
                <td className="px-2.5 py-2.5 border-b border-slate-50"><StatutBadge statut={s.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}