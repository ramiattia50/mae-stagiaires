import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import api from "../api/client";
import { SkeletonListCard, SkeletonRow } from "../components/Skeleton";
import { useToast } from "../components/ToastProvider";

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

function Actions({ e, actionEnCours, valider }) {
  if (e.statutValidation !== "EN_ATTENTE") return null;
  return (
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
  );
}

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [filtre, setFiltre] = useState("EN_ATTENTE");
  const [loading, setLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);
  const toast = useToast();

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
      toast.success(statutValidation === "VALIDEE" ? "Evaluation validee." : "Evaluation renvoyee pour revision.");
      charger();
    } catch (err) {
      toast.error("Erreur lors de la validation.");
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 overflow-auto">
      <div className="mb-5">
        <h1 className="font-display text-xl lg:text-[22px] font-bold text-mae-blue">Evaluations</h1>
        <p className="text-sm text-slate-500 mt-0.5">{evaluations.length} evaluation(s)</p>
      </div>

      <select
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
        className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white mb-5 w-full sm:w-auto"
      >
        <option value="">Toutes</option>
        <option value="EN_ATTENTE">En attente</option>
        <option value="VALIDEE">Validee</option>
        <option value="REJETEE_POUR_REVISION">A revoir</option>
      </select>

      {loading ? (
        <>
          <div className="hidden md:block bg-white border border-slate-200/70 rounded-2xl px-5 py-2 shadow-sm">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
          </div>
          <div className="md:hidden space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonListCard key={i} />)}
          </div>
        </>
      ) : evaluations.length === 0 ? (
        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-14 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <ClipboardCheck size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Aucune evaluation ici</p>
          <p className="text-xs text-slate-400 mt-1">Les evaluations soumises par les tuteurs apparaitront ici.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Stagiaire", "Departement", "Tuteur", "Note", "Date", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2.5 py-2 border-b border-slate-100 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluations.map((e) => {
                  const candidat = e.stagiaire?.candidature?.candidat;
                  return (
                    <tr key={e.id}>
                      <td className="px-2.5 py-2.5 text-sm text-mae-blue font-medium border-b border-slate-50 whitespace-nowrap">
                        {candidat?.prenom} {candidat?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                        {e.stagiaire?.departement?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                        {e.tuteur?.prenom} {e.tuteur?.nom}
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                        {e.note ?? "-"} / 20
                      </td>
                      <td className="px-2.5 py-2.5 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                        {new Date(e.dateEvaluation).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-slate-50">
                        <ValidationBadge statut={e.statutValidation} />
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-slate-50 whitespace-nowrap">
                        <Actions e={e} actionEnCours={actionEnCours} valider={valider} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {evaluations.map((e) => {
              const candidat = e.stagiaire?.candidature?.candidat;
              return (
                <div key={e.id} className="bg-white border border-slate-200/70 rounded-2xl px-4 py-4 shadow-sm">
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-sm font-medium text-mae-blue">{candidat?.prenom} {candidat?.nom}</p>
                    <ValidationBadge statut={e.statutValidation} />
                  </div>
                  <p className="text-xs text-slate-500">{e.stagiaire?.departement?.nom} - Tuteur : {e.tuteur?.prenom} {e.tuteur?.nom}</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-3">
                    Note : <span className="font-medium text-mae-blue">{e.note ?? "-"} / 20</span> - {new Date(e.dateEvaluation).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="pt-2 border-t border-slate-100">
                    <Actions e={e} actionEnCours={actionEnCours} valider={valider} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
