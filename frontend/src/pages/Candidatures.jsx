import { useEffect, useState } from "react";
import api from "../api/client";
import AffectationForm from "../components/AffectationForm";

const STATUT_LABELS = {
  DEPOSEE: { label: "Deposee", color: "text-slate-500", bg: "bg-slate-100" },
  EN_COURS_ETUDE: { label: "En cours detude", color: "text-amber-600", bg: "bg-amber-50" },
  ACCEPTEE: { label: "Acceptee", color: "text-mae-teal", bg: "bg-mae-teal/10" },
  REFUSEE: { label: "Refusee", color: "text-red-600", bg: "bg-red-50" },
};

function StatutCandidatureBadge({ statut }) {
  const config = STATUT_LABELS[statut] ?? STATUT_LABELS.DEPOSEE;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}

export default function Candidatures() {
  const [candidatures, setCandidatures] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);
  const [candidatureAAffecter, setCandidatureAAffecter] = useState(null);

  function charger() {
    setLoading(true);
    const params = {};
    if (filtreStatut) params.statut = filtreStatut;

    api
      .get("/candidatures", { params })
      .then((res) => setCandidatures(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(charger, [filtreStatut]);

  async function changerStatut(id, statut) {
    setActionEnCours(id);
    try {
      await api.patch(`/candidatures/${id}/statut`, { statut });
      charger();
    } catch (err) {
      alert("Erreur lors du changement de statut.");
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <main className="flex-1 px-8 py-7 overflow-auto">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-mae-blue">Candidatures</h1>
        <p className="text-sm text-slate-500 mt-0.5">{candidatures.length} candidature(s)</p>
      </div>

      <div className="flex gap-3 mb-5">
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="DEPOSEE">Deposee</option>
          <option value="EN_COURS_ETUDE">En cours detude</option>
          <option value="ACCEPTEE">Acceptee</option>
          <option value="REFUSEE">Refusee</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Candidat", "Type de stage", "Sujet", "Depose le", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidatures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-slate-400 py-6">
                    Aucune candidature trouvee.
                  </td>
                </tr>
              ) : (
                candidatures.map((c) => (
                  <tr key={c.id}>
                    <td className="px-2.5 py-2.5 text-sm text-mae-blue font-medium border-b border-slate-50">
                      {c.candidat?.prenom} {c.candidat?.nom}
                    </td>
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{c.typeStage}</td>
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{c.sujetStage ?? "-"}</td>
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                      {new Date(c.dateDepot).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-slate-50">
                      <StatutCandidatureBadge statut={c.statut} />
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-slate-50">
                      {c.statut === "DEPOSEE" && (
                        <button
                          disabled={actionEnCours === c.id}
                          onClick={() => changerStatut(c.id, "EN_COURS_ETUDE")}
                          className="text-xs text-mae-teal font-medium disabled:opacity-50"
                        >
                          Etudier
                        </button>
                      )}
                      {c.statut === "EN_COURS_ETUDE" && (
                        <div className="flex gap-3">
                          <button
                            disabled={actionEnCours === c.id}
                            onClick={() => changerStatut(c.id, "ACCEPTEE")}
                            className="text-xs text-mae-teal font-medium disabled:opacity-50"
                          >
                            Accepter
                          </button>
                          <button
                            disabled={actionEnCours === c.id}
                            onClick={() => changerStatut(c.id, "REFUSEE")}
                            className="text-xs text-red-600 font-medium disabled:opacity-50"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      {c.statut === "ACCEPTEE" && !c.stagiaire && (
                        <button
                          onClick={() => setCandidatureAAffecter(c)}
                          className="text-xs text-mae-blue font-medium underline"
                        >
                          Affecter
                        </button>
                      )}
                      {c.statut === "ACCEPTEE" && c.stagiaire && (
                        <span className="text-xs text-slate-400">Deja affecte</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {candidatureAAffecter && (
        <AffectationForm
          candidature={candidatureAAffecter}
          onClose={() => setCandidatureAAffecter(null)}
          onSuccess={() => {
            setCandidatureAAffecter(null);
            charger();
          }}
        />
      )}
    </main>
  );
}
