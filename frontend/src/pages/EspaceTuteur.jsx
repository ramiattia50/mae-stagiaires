import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";

export default function EspaceTuteur() {
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stagiaireAEvaluer, setStagiaireAEvaluer] = useState(null);
  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  const utilisateurBrut = window.localStorage.getItem("mae_utilisateur");
  const utilisateur = utilisateurBrut ? JSON.parse(utilisateurBrut) : null;

  function charger() {
    setLoading(true);
    api.get("/stagiaires").then((res) => setStagiaires(res.data)).finally(() => setLoading(false));
  }

  useEffect(charger, []);

  function handleDeconnexion() {
    window.localStorage.removeItem("mae_token");
    window.localStorage.removeItem("mae_utilisateur");
    navigate("/connexion");
  }

  function ouvrirFormulaire(stagiaire) {
    setStagiaireAEvaluer(stagiaire);
    setNote("");
    setCommentaire("");
    setErreur("");
  }

  async function soumettreEvaluation(e) {
    e.preventDefault();
    setErreur("");
    const noteNum = Number(note);
    if (!note || noteNum < 0 || noteNum > 20) {
      setErreur("La note doit etre comprise entre 0 et 20.");
      return;
    }
    setEnCours(true);
    try {
      await api.post("/evaluations", {
        stagiaireId: stagiaireAEvaluer.id,
        note: noteNum,
        commentaire,
      });
      setStagiaireAEvaluer(null);
      charger();
    } catch (err) {
      setErreur("Erreur lors de lenvoi de levaluation.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div>
          <p className="font-display font-bold text-mae-blue">MAE Assurances</p>
          <p className="text-xs text-slate-400">Espace tuteur</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{utilisateur?.prenom} {utilisateur?.nom}</span>
          <button onClick={handleDeconnexion} className="text-xs text-red-600 font-medium">
            Se deconnecter
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="font-display text-xl font-bold text-mae-blue mb-6">Mes stagiaires</h1>

        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : stagiaires.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center">
            <p className="text-sm text-slate-400">Aucun stagiaire ne vous est encore affecte.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stagiaires.map((s) => {
              const candidat = s.candidature?.candidat;
              const dejaEvalue = s.evaluations?.length > 0;
              return (
                <div key={s.id} className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-mae-blue">{candidat?.prenom} {candidat?.nom}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {s.departement?.nom} - du {new Date(s.dateDebut).toLocaleDateString("fr-FR")} au {new Date(s.dateFin).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatutBadge statut={s.statut} />
                    <button
                      onClick={() => ouvrirFormulaire(s)}
                      className="text-xs text-mae-teal font-medium underline"
                    >
                      {dejaEvalue ? "Evaluer a nouveau" : "Evaluer"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {stagiaireAEvaluer && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={soumettreEvaluation} className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="font-display text-lg font-bold text-mae-blue mb-1">Evaluer le stagiaire</h2>
            <p className="text-sm text-slate-500 mb-4">
              {stagiaireAEvaluer.candidature?.candidat?.prenom} {stagiaireAEvaluer.candidature?.candidat?.nom}
            </p>

            {erreur && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">{erreur}</div>
            )}

            <label className="block text-sm text-slate-600 mb-1">Note (sur 20)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 text-sm"
            />

            <label className="block text-sm text-slate-600 mb-1">Commentaire</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 text-sm"
              placeholder="Points forts, axes damelioration..."
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStagiaireAEvaluer(null)}
                className="flex-1 border border-slate-300 rounded-lg py-2 text-sm font-medium text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours}
                className="flex-1 bg-mae-blue text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
