import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";
import UserMenu from "../components/UserMenu";
import { SkeletonBar, SkeletonCard, SkeletonRow } from "../components/Skeleton";

const PIE_COLORS = ["#0B3D62", "#2D8577", "#D97706", "#94A3B8"];

function KpiCard({ label, value, sublabel }) {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm hover:shadow-md transition-shadow">
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
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 overflow-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="font-display text-xl lg:text-[22px] font-bold text-mae-blue">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vue d ensemble des stages</p>
        </div>
        <div className="hidden lg:flex items-center gap-3.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-56">
            <Search size={15} className="text-slate-400" />
            <span className="text-sm text-slate-400">Rechercher...</span>
          </div>
          <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <Bell size={16} className="text-slate-500" />
          </button>
          <UserMenu />
        </div>
      </div>

      {erreur && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm">{erreur}</div>
      )}

      {loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-6">
            <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm h-[254px] flex items-end gap-3">
              {[60, 90, 40, 75, 50].map((h, i) => (
                <SkeletonBar key={i} width="16%" height={`${h}%`} className="rounded-t-lg rounded-b-none" />
              ))}
            </div>
            <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm flex items-center justify-center h-[254px]">
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
          <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-2 shadow-sm">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <KpiCard label="Stagiaires actifs" value={stats?.stagiairesActifs ?? "-"} sublabel="En cours" />
            <KpiCard label="Candidatures" value={stats?.candidaturesEnAttente ?? "-"} sublabel="En attente" />
            <KpiCard label="Stages a venir" value={stats?.stagesAVenir ?? "-"} sublabel="Prochainement" />
            <KpiCard label="Evaluations" value={stats?.evaluationsEnAttente ?? "-"} sublabel="A valider" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-6">
            <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
              <p className="font-display text-sm font-semibold text-mae-blue mb-4">
                Stagiaires par departement
              </p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={stats?.parDepartement ?? []} barSize={28}>
                  <XAxis dataKey="departement" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "10px", border: "1px solid #E5E7EB" }} />
                  <Bar dataKey="nombre" fill="#2D8577" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
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
                    paddingAngle={3}
                  >
                    {(stats?.parTypeStage ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
            <div className="flex justify-between items-center mb-3.5">
              <p className="font-display text-sm font-semibold text-mae-blue">Stagiaires recents</p>
              <button className="text-xs text-mae-teal font-medium">Voir tout</button>
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Nom", "Departement", "Tuteur", "Debut", "Statut"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100 whitespace-nowrap">
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
                        <td className="px-2.5 py-2.5 text-sm text-mae-blue font-medium border-b border-slate-50 whitespace-nowrap">
                          {s.candidature?.candidat?.prenom} {s.candidature?.candidat?.nom}
                        </td>
                        <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                          {s.departement?.nom}
                        </td>
                        <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                          {s.tuteur?.prenom} {s.tuteur?.nom}
                        </td>
                        <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
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

            <div className="sm:hidden space-y-2.5">
              {stagiaires.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Aucun stagiaire pour le moment.</p>
              ) : (
                stagiaires.map((s) => (
                  <div key={s.id} className="border border-slate-100 rounded-xl px-3.5 py-3">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-sm font-medium text-mae-blue">
                        {s.candidature?.candidat?.prenom} {s.candidature?.candidat?.nom}
                      </p>
                      <StatutBadge statut={s.statut} />
                    </div>
                    <p className="text-xs text-slate-500">{s.departement?.nom} - {s.tuteur?.prenom} {s.tuteur?.nom}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Debut : {new Date(s.dateDebut).toLocaleDateString("fr-FR")}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
