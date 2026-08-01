import { useEffect, useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";
import UserMenu from "../components/UserMenu";

const PIE_COLORS = ["#0B3D62", "#2D8577", "#D97706", "#94A3B8"];

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
  const [stats, setStats] = useState(null);
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    async function charger() {
      try {
        const [statsRes, stagiairesRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/stagiaires"),
        ]);
        setStats(statsRes.data);
        setStagiaires(stagiairesRes.data.slice(0, 5));
      } catch (err) {
        setErreur("Impossible de charger les donnees. Verifiez que le backend est demarre.");
      } finally {
        setLoading(false);
      }
    }
    charger();
  }, []);

  return (
    <main className="flex-1 px-8 py-7 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-[22px] font-bold text-mae-blue">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vue d ensemble des stages</p>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-56">
            <Search size={15} className="text-slate-400" />
            <span className="text-sm text-slate-400">Rechercher...</span>
          </div>
          <button className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
            <Bell size={16} className="text-slate-500" />
          </button>
          <UserMenu />
        </div>
      </div>

      {erreur && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 text-amber-700 text-sm">{erreur}</div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Chargement...</p>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <KpiCard label="Stagiaires actifs" value={stats?.stagiairesActifs ?? "-"} sublabel="En cours" />
            <KpiCard label="Candidatures en attente" value={stats?.candidaturesEnAttente ?? "-"} sublabel="A traiter" />
            <KpiCard label="Stages a venir" value={stats?.stagesAVenir ?? "-"} sublabel="Prochainement" />
            <KpiCard label="Evaluations en attente" value={stats?.evaluationsEnAttente ?? "-"} sublabel="Validation RH" />
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-[1.4] bg-white border border-slate-200 rounded-xl px-5 py-5">
              <p className="font-display text-sm font-semibold text-mae-blue mb-4">
                Stagiaires par departement
              </p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={stats?.parDepartement ?? []} barSize={28}>
                  <XAxis dataKey="departement" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                  <Bar dataKey="nombre" fill="#2D8577" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-5">
              <p className="font-display text-sm font-semibold text-mae-blue mb-4">
                Repartition par type de stage
              </p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={stats?.parTypeStage ?? []}
                    dataKey="nombre"
                    nameKey="type"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={2}
                  >
                    {(stats?.parTypeStage ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
            <div className="flex justify-between items-center mb-3.5">
              <p className="font-display text-sm font-semibold text-mae-blue">Stagiaires recents</p>
              <button className="text-xs text-mae-teal font-medium">Voir tout</button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Nom", "Departement", "Tuteur", "Debut", "Statut"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stagiaires.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-slate-400 py-6">
                      Aucun stagiaire pour le moment.
                    </td>
                  </tr>
                ) : (
                  stagiaires.map((s) => (
                    <tr key={s.id}>
                      <td className="px-2.5 py-2.5 text-sm text-mae-blue font-medium border-b border-slate-50">
                        {s.candidature?.candidat?.prenom} {s.candidature?.candidat?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                        {s.departement?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                        {s.tuteur?.prenom} {s.tuteur?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                        {new Date(s.dateDebut).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-slate-50">
                        <StatutBadge statut={s.statut} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

