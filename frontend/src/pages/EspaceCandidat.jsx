import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import api from "../api/client";
import { useToast } from "../components/ToastProvider";

const STATUT_LABELS = {
  DEPOSEE: { label: "Deposee", color: "text-slate-500", bg: "bg-slate-100" },
  EN_COURS_ETUDE: { label: "En cours detude", color: "text-amber-600", bg: "bg-amber-50" },
  ACCEPTEE: { label: "Acceptee", color: "text-mae-teal", bg: "bg-mae-teal/10" },
  REFUSEE: { label: "Refusee", color: "text-red-600", bg: "bg-red-50" },
};

function StatutBadge({ statut }) {
  const config = STATUT_LABELS[statut] ?? STATUT_LABELS.DEPOSEE;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}

export default function EspaceCandidat() {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const utilisateurBrut = window.localStorage.getItem("mae_utilisateur");
  const utilisateur = utilisateurBrut ? JSON.parse(utilisateurBrut) : null;

  const [typeStage, setTypeStage] = useState("PFE");
  const [sujetStage, setSujetStage] = useState("");
  const [dateDebutSouhaitee, setDateDebutSouhaitee] = useState("");
  const [dateFinSouhaitee, setDateFinSouhaitee] = useState("");
  const [fichierCV, setFichierCV] = useState(null);
  const [fichierLettre, setFichierLettre] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  function charger() {
    setLoading(true);
    api.get("/candidatures/mes-candidatures").then((res) => setCandidatures(res.data)).finally(() => setLoading(false));
  }

  useEffect(charger, []);

  function handleDeconnexion() {
    window.localStorage.removeItem("mae_token");
    window.localStorage.removeItem("mae_utilisateur");
    navigate("/connexion");
  }

  async function uploaderPiece(candidatureId, fichier, type) {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("type", type);
    await api.post(`/pieces-jointes/${candidatureId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (!dateDebutSouhaitee || !dateFinSouhaitee) {
      setErreur("Merci de renseigner les dates souhaitees.");
      return;
    }
    setEnCours(true);
    try {
      const res = await api.post("/candidatures", { typeStage, sujetStage, dateDebutSouhaitee, dateFinSouhaitee });
      const candidatureId = res.data.id;

      if (fichierCV) await uploaderPiece(candidatureId, fichierCV, "CV");
      if (fichierLettre) await uploaderPiece(candidatureId, fichierLettre, "LETTRE_MOTIVATION");

      setAfficherForm(false);
      setSujetStage("");
      setDateDebutSouhaitee("");
      setDateFinSouhaitee("");
      setFichierCV(null);
      setFichierLettre(null);
      toast.success("Candidature deposee avec succes.");
      charger();
    } catch (err) {
      setErreur("Erreur lors du depot de la candidature.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <p className="font-display font-bold text-mae-blue text-sm sm:text-base">MAE Assurances</p>
          <p className="text-xs text-slate-400">Espace candidat</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline text-sm text-slate-600">{utilisateur?.prenom} {utilisateur?.nom}</span>
          <button onClick={handleDeconnexion} className="text-xs text-red-600 font-medium">
            Deconnexion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="font-display text-lg sm:text-xl font-bold text-mae-blue">Mes candidatures</h1>
          <button
            onClick={() => setAfficherForm(true)}
            className="bg-mae-blue text-white rounded-xl px-4 py-2.5 text-sm font-medium active:scale-[0.98] transition-transform"
          >
            Deposer une candidature
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : candidatures.length === 0 ? (
          <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-14 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FolderOpen size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Aucune candidature pour le moment</p>
            <p className="text-xs text-slate-400 mt-1">Deposez votre premiere candidature pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidatures.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200/70 rounded-2xl px-4 sm:px-5 py-4 shadow-sm">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-mae-blue">{c.sujetStage || c.typeStage}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.typeStage} - Depose le {new Date(c.dateDepot).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <StatutBadge statut={c.statut} />
                </div>
                {c.piecesJointes?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3">
                    {c.piecesJointes.map((p) => (
                      <span key={p.id} className="text-xs text-slate-500">
                        {p.type === "CV" ? "CV joint" : "Lettre de motivation jointe"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {afficherForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto animate-[slideIn_0.2s_ease-out]">
            <h2 className="font-display text-lg font-bold text-mae-blue mb-4">Deposer une candidature</h2>

            {erreur && (
              <div className="mb-3 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">{erreur}</div>
            )}

            <label className="block text-sm text-slate-600 mb-1.5">Type de stage</label>
            <select
              value={typeStage}
              onChange={(e) => setTypeStage(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-3 text-sm"
            >
              <option value="PFE">PFE</option>
              <option value="STAGE_ETE">Stage dete</option>
              <option value="STAGE_OBSERVATION">Stage dobservation</option>
              <option value="ALTERNANCE">Alternance</option>
            </select>

            <label className="block text-sm text-slate-600 mb-1.5">Sujet souhaite</label>
            <input
              value={sujetStage}
              onChange={(e) => setSujetStage(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-3 text-sm"
              placeholder="Ex: Application de gestion des stagiaires"
            />

            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-sm text-slate-600 mb-1.5">Debut souhaite</label>
                <input
                  type="date"
                  value={dateDebutSouhaitee}
                  onChange={(e) => setDateDebutSouhaitee(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-slate-600 mb-1.5">Fin souhaitee</label>
                <input
                  type="date"
                  value={dateFinSouhaitee}
                  onChange={(e) => setDateFinSouhaitee(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <label className="block text-sm text-slate-600 mb-1.5">CV (PDF, DOC)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFichierCV(e.target.files[0])}
              className="w-full text-xs sm:text-sm mb-3"
            />

            <label className="block text-sm text-slate-600 mb-1.5">Lettre de motivation (PDF, DOC)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFichierLettre(e.target.files[0])}
              className="w-full text-xs sm:text-sm mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAfficherForm(false)}
                className="flex-1 border border-slate-300 rounded-xl py-2.5 text-sm font-medium text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours}
                className="flex-1 bg-mae-blue text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                Deposer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
