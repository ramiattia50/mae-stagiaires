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
    <main className="flex-1 px-8 py-7 overflow-auto">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-mae-blue">Stagiaires</h1>
        <p className="text-sm text-slate-500 mt-0.5">{stagiaires.length} stagiaire(s)</p>
      </div>

      <div className="flex gap-3 mb-5">
        <select
          value={filtreDept}
          onChange={(e) => setFiltreDept(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les departements</option>
          {departements.map((d) => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </select>

        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="A_VENIR">A venir</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Termine</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Nom", "Departement", "Tuteur", "Debut", "Fin", "Statut"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stagiaires.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-slate-400 py-6">
                    Aucun stagiaire trouve.
                  </td>
                </tr>
              ) : (
                stagiaires.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/stagiaires/${s.id}`)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
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
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                      {new Date(s.dateFin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-slate-50">
                      <StatutBadge statut={s.statut} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
