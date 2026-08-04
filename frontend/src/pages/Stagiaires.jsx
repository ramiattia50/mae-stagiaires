import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users2, Search } from "lucide-react";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";
import Pagination from "../components/Pagination";
import { SkeletonListCard, SkeletonRow } from "../components/Skeleton";

const PAR_PAGE = 8;

export default function Stagiaires() {
  const [stagiaires, setStagiaires] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [filtreDept, setFiltreDept] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recherche = (searchParams.get("q") ?? "").toLowerCase();

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

  useEffect(() => setPage(1), [filtreDept, filtreStatut, recherche]);

  const filtres = stagiaires.filter((s) => {
    if (!recherche) return true;
    const nomComplet = `${s.candidature?.candidat?.prenom ?? ""} ${s.candidature?.candidat?.nom ?? ""}`.toLowerCase();
    return nomComplet.includes(recherche);
  });

  const totalPages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));
  const pageActuelle = filtres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 overflow-auto">
      <div className="mb-5">
        <h1 className="font-display text-xl lg:text-[22px] font-bold text-mae-blue">Stagiaires</h1>
        <p className="text-sm text-slate-500 mt-0.5">{filtres.length} stagiaire(s)</p>
      </div>

      {recherche && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2 bg-mae-teal/10 rounded-xl text-sm text-mae-blue w-fit">
          <Search size={14} />
          Resultats pour "{recherche}"
        </div>
      )}

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
        <>
          <div className="hidden md:block bg-white border border-slate-200/70 rounded-2xl px-5 py-2 shadow-sm">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}
          </div>
          <div className="md:hidden space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonListCard key={i} />)}
          </div>
        </>
      ) : filtres.length === 0 ? (
        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-14 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Users2 size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Aucun stagiaire trouve</p>
          <p className="text-xs text-slate-400 mt-1">Essayez de modifier vos filtres ou votre recherche.</p>
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
                {pageActuelle.map((s) => (
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
            {pageActuelle.map((s) => (
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

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </main>
  );
}
