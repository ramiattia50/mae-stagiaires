import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

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

  const utilisateurBrut = window.localStorage.getItem("mae_utilisateur");
  const utilisateur = utilisateurBrut ? JSON.parse(utilisateurBrut) : null;

  const [typeStage, setTypeStage] = useState("PFE");
  const [sujetStage, setSujetStage] = useState("");
  const [dateDebutSouhaitee, setDateDebutSouhaitee] = useState("");
  const [dateFinSouhaitee, setDateFinSouhaitee] = useState("");
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

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (!dateDebutSouhaitee || !dateFinSouhaitee) {
      setErreur("Merci de renseigner les dates souhaitees.");
      return;
    }
    setEnCours(true);
    try {
      await api.post("/candidatures", { typeStage, sujetStage, dateDebutSouhaitee, dateFinSouhaitee });
      setAfficherForm(false);
      setSujetStage("");
      setDateDebutSouhaitee("");
      setDateFinSouhaitee("");
      charger();
    } catch (err) {
      setErreur("Erreur lors du depot de la candidature.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div>
          <p className="font-display font-bold text-mae-blue">MAE Assurances</p>
          <p className="text-xs text-slate-400">Espace candidat</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{utilisateur?.prenom} {utilisateur?.nom}</span>
          <button onClick={handleDeconnexion} className="text-xs text-red-600 font-medium">
            Se deconnecter
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-xl font-bold text-mae-blue">Mes candidatures</h1>
          <button
            onClick={() => setAfficherForm(true)}
            className="bg-mae-blue text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Deposer une candidature
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : candidatures.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center">
            <p className="text-sm text-slate-400">Vous navez pas encore depose de candidature.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidatures.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-mae-blue">{c.sujetStage || c.typeStage}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.typeStage} - Depose le {new Date(c.dateDepot).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <StatutBadge statut={c.statut} />
              </div>
            ))}
          </div>
        )}
      </main>

      {afficherForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="font-display text-lg font-bold text-mae-blue mb-4">Deposer une candidature</h2>

            {erreur && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">{erreur}</div>
            )}

            <label className="block text-sm text-slate-600 mb-1">Type de stage</label>
            <select
              value={typeStage}
              onChange={(e) => setTypeStage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 text-sm"
            >
              <option value="PFE">PFE</option>
              <option value="STAGE_ETE">Stage dete</option>
              <option value="STAGE_OBSERVATION">Stage dobservation</option>
              <option value="ALTERNANCE">Alternance</option>
            </select>

            <label className="block text-sm text-slate-600 mb-1">Sujet souhaite</label>
            <input
              value={sujetStage}
              onChange={(e) => setSujetStage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 text-sm"
              placeholder="Ex: Application de gestion des stagiaires"
            />

            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-sm text-slate-600 mb-1">Debut souhaite</label>
                <input
                  type="date"
                  value={dateDebutSouhaitee}
                  onChange={(e) => setDateDebutSouhaitee(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-slate-600 mb-1">Fin souhaitee</label>
                <input
                  type="date"
                  value={dateFinSouhaitee}
                  onChange={(e) => setDateFinSouhaitee(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAfficherForm(false)}
                className="flex-1 border border-slate-300 rounded-lg py-2 text-sm font-medium text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours}
                className="flex-1 bg-mae-blue text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
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
