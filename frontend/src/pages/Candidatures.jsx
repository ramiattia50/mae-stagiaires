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

function Actions({ c, actionEnCours, changerStatut, setCandidatureAAffecter }) {
  if (c.statut === "DEPOSEE") {
    return (
      <button
        disabled={actionEnCours === c.id}
        onClick={() => changerStatut(c.id, "EN_COURS_ETUDE")}
        className="text-xs text-mae-teal font-medium disabled:opacity-50"
      >
        Etudier
      </button>
    );
  }
  if (c.statut === "EN_COURS_ETUDE") {
    return (
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
    );
  }
  if (c.statut === "ACCEPTEE" && !c.stagiaire) {
    return (
      <button onClick={() => setCandidatureAAffecter(c)} className="text-xs text-mae-blue font-medium underline">
        Affecter
      </button>
    );
  }
  if (c.statut === "ACCEPTEE" && c.stagiaire) {
    return <span className="text-xs text-slate-400">Deja affecte</span>;
  }
  return null;
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
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 overflow-auto">
      <div className="mb-5">
        <h1 className="font-display text-xl lg:text-[22px] font-bold text-mae-blue">Candidatures</h1>
        <p className="text-sm text-slate-500 mt-0.5">{candidatures.length} candidature(s)</p>
      </div>

      <select
        value={filtreStatut}
        onChange={(e) => setFiltreStatut(e.target.value)}
        className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white mb-5 w-full sm:w-auto"
      >
        <option value="">Tous les statuts</option>
        <option value="DEPOSEE">Deposee</option>
        <option value="EN_COURS_ETUDE">En cours detude</option>
        <option value="ACCEPTEE">Acceptee</option>
        <option value="REFUSEE">Refusee</option>
      </select>

      {loading ? (
        <p className="text-sm text-slate-400">Chargement...</p>
      ) : candidatures.length === 0 ? (
        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-10 text-center shadow-sm">
          <p className="text-sm text-slate-400">Aucune candidature trouvee.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Candidat", "Type de stage", "Sujet", "Depose le", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidatures.map((c) => (
                  <tr key={c.id}>
                    <td className="px-2.5 py-2.5 text-sm text-mae-blue font-medium border-b border-slate-50 whitespace-nowrap">
                      {c.candidat?.prenom} {c.candidat?.nom}
                    </td>
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">{c.typeStage}</td>
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">{c.sujetStage ?? "-"}</td>
                    <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                      {new Date(c.dateDepot).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-slate-50">
                      <StatutCandidatureBadge statut={c.statut} />
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-slate-50 whitespace-nowrap">
                      <Actions c={c} actionEnCours={actionEnCours} changerStatut={changerStatut} setCandidatureAAffecter={setCandidatureAAffecter} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {candidatures.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200/70 rounded-2xl px-4 py-4 shadow-sm">
                <div className="flex justify-between items-start mb-1.5">
                  <p className="text-sm font-medium text-mae-blue">{c.candidat?.prenom} {c.candidat?.nom}</p>
                  <StatutCandidatureBadge statut={c.statut} />
                </div>
                <p className="text-xs text-slate-500">{c.typeStage} - {c.sujetStage ?? "Sans sujet"}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">Depose le {new Date(c.dateDepot).toLocaleDateString("fr-FR")}</p>
                <div className="pt-2 border-t border-slate-100">
                  <Actions c={c} actionEnCours={actionEnCours} changerStatut={changerStatut} setCandidatureAAffecter={setCandidatureAAffecter} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
