import { useEffect, useState } from "react";
import api from "../api/client";

const VALIDATION_LABELS = {
  EN_ATTENTE: { label: "En attente", color: "text-amber-600", bg: "bg-amber-50" },
  VALIDEE: { label: "Validee", color: "text-mae-teal", bg: "bg-mae-teal/10" },
  REJETEE_POUR_REVISION: { label: "A revoir", color: "text-red-600", bg: "bg-red-50" },
};

function ValidationBadge({ statut }) {
  const config = VALIDATION_LABELS[statut] ?? VALIDATION_LABELS.EN_ATTENTE;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [filtre, setFiltre] = useState("EN_ATTENTE");
  const [loading, setLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);

  function charger() {
    setLoading(true);
    const params = {};
    if (filtre) params.statutValidation = filtre;

    api
      .get("/evaluations", { params })
      .then((res) => setEvaluations(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(charger, [filtre]);

  async function valider(id, statutValidation) {
    setActionEnCours(id);
    try {
      await api.patch(`/evaluations/${id}/validation`, { statutValidation });
      charger();
    } catch (err) {
      alert("Erreur lors de la validation.");
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <main className="flex-1 px-8 py-7 overflow-auto">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-mae-blue">Evaluations</h1>
        <p className="text-sm text-slate-500 mt-0.5">{evaluations.length} evaluation(s)</p>
      </div>

      <div className="flex gap-3 mb-5">
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Toutes</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDEE">Validee</option>
          <option value="REJETEE_POUR_REVISION">A revoir</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-5">
        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Stagiaire", "Departement", "Tuteur", "Note", "Date", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-slate-400 py-6">
                    Aucune evaluation trouvee.
                  </td>
                </tr>
              ) : (
                evaluations.map((e) => {
                  const candidat = e.stagiaire?.candidature?.candidat;
                  return (
                    <tr key={e.id}>
                      <td className="px-2.5 py-2.5 text-sm text-mae-blue font-medium border-b border-slate-50">
                        {candidat?.prenom} {candidat?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                        {e.stagiaire?.departement?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                        {e.tuteur?.prenom} {e.tuteur?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                        {e.note ?? "-"} / 20
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50">
                        {new Date(e.dateEvaluation).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-slate-50">
                        <ValidationBadge statut={e.statutValidation} />
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-slate-50">
                        {e.statutValidation === "EN_ATTENTE" && (
                          <div className="flex gap-3">
                            <button
                              disabled={actionEnCours === e.id}
                              onClick={() => valider(e.id, "VALIDEE")}
                              className="text-xs text-mae-teal font-medium disabled:opacity-50"
                            >
                              Valider
                            </button>
                            <button
                              disabled={actionEnCours === e.id}
                              onClick={() => valider(e.id, "REJETEE_POUR_REVISION")}
                              className="text-xs text-red-600 font-medium disabled:opacity-50"
                            >
                              Renvoyer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
