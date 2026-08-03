import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";

export default function Stagiaires() {
  const [stagiaires, setStagiaires] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [filtreDept, setFiltreDept] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/departements").then((res) => setDepartements(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filtreDept) params.departementId = filtreDept;
    if (filtreStatut) params.statut = filtreStatut;

    api
      .get("/stagiaires", { params })
      .then((res) => setStagiaires(res.data))
      .finally(() => setLoading(false));
  }, [filtreDept, filtreStatut]);

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 overflow-auto">
      <div className="mb-5">
        <h1 className="font-display text-xl lg:text-[22px] font-bold text-mae-blue">Stagiaires</h1>
        <p className="text-sm text-slate-500 mt-0.5">{stagiaires.length} stagiaire(s)</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          value={filtreDept}
          onChange={(e) => setFiltreDept(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les departements</option>
          {departements.map((d) => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </select>

        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="A_VENIR">A venir</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Termine</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Chargement...</p>
      ) : stagiaires.length === 0 ? (
        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-10 text-center shadow-sm">
          <p className="text-sm text-slate-400">Aucun stagiaire trouve.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Nom", "Departement", "Tuteur", "Debut", "Fin", "Statut"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stagiaires.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/stagiaires/${s.id}`)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
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
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                      {new Date(s.dateFin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-slate-50">
                      <StatutBadge statut={s.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {stagiaires.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/stagiaires/${s.id}`)}
                className="bg-white border border-slate-200/70 rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <p className="text-sm font-medium text-mae-blue">
                    {s.candidature?.candidat?.prenom} {s.candidature?.candidat?.nom}
                  </p>
                  <StatutBadge statut={s.statut} />
                </div>
                <p className="text-xs text-slate-500">{s.departement?.nom} - {s.tuteur?.prenom} {s.tuteur?.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(s.dateDebut).toLocaleDateString("fr-FR")} au {new Date(s.dateFin).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
