import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Building2, User, Calendar } from "lucide-react";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";

export default function StagiaireFiche() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stagiaire, setStagiaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api
      .get(`/stagiaires/${id}`)
      .then((res) => setStagiaire(res.data))
      .catch(() => setErreur("Impossible de charger ce stagiaire."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="flex-1 px-8 py-7"><p className="text-sm text-slate-400">Chargement...</p></main>;
  }

  if (erreur || !stagiaire) {
    return <main className="flex-1 px-8 py-7"><p className="text-sm text-red-600">{erreur ?? "Stagiaire introuvable."}</p></main>;
  }

  const candidat = stagiaire.candidature?.candidat;

  return (
    <main className="flex-1 px-8 py-7 overflow-auto">
      <button
        onClick={() => navigate("/stagiaires")}
        className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 hover:text-mae-blue"
      >
        <ArrowLeft size={15} /> Retour a la liste
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-mae-blue">
            {candidat?.prenom} {candidat?.nom}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{stagiaire.candidature?.sujetStage}</p>
        </div>
        <StatutBadge statut={stagiaire.statut} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Informations</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Mail size={15} className="text-slate-400" /> {candidat?.email}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Building2 size={15} className="text-slate-400" /> {stagiaire.departement?.nom}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <User size={15} className="text-slate-400" /> Tuteur : {stagiaire.tuteur?.prenom} {stagiaire.tuteur?.nom}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Calendar size={15} className="text-slate-400" />
              {new Date(stagiaire.dateDebut).toLocaleDateString("fr-FR")} au {new Date(stagiaire.dateFin).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Evaluations</p>
          {stagiaire.evaluations?.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune evaluation pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {stagiaire.evaluations.map((e) => (
                <div key={e.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-600">{new Date(e.dateEvaluation).toLocaleDateString("fr-FR")}</span>
                  <span className="font-medium text-mae-blue">{e.note ?? "-"} / 20</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
        <p className="font-display text-sm font-semibold text-mae-blue mb-4">Historique de presence</p>
        {stagiaire.presences?.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune presence enregistree.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Date", "Statut", "Arrivee", "Depart"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stagiaire.presences.map((p) => (
                <tr key={p.id}>
                  <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                    {new Date(p.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{p.statut}</td>
                  <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{p.heureArrivee ?? "-"}</td>
                  <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{p.heureDepart ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
