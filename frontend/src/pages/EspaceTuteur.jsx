import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users2 } from "lucide-react";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";
import { useToast } from "../components/ToastProvider";

export default function EspaceTuteur() {
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stagiaireAEvaluer, setStagiaireAEvaluer] = useState(null);
  const [stagiaireAPointer, setStagiaireAPointer] = useState(null);
  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [datePresence, setDatePresence] = useState(new Date().toISOString().slice(0, 10));
  const [statutPresence, setStatutPresence] = useState("PRESENT");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

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

  function ouvrirFormulaireEvaluation(stagiaire) {
    setStagiaireAEvaluer(stagiaire);
    setNote("");
    setCommentaire("");
    setErreur("");
  }

  function ouvrirFormulairePresence(stagiaire) {
    setStagiaireAPointer(stagiaire);
    setDatePresence(new Date().toISOString().slice(0, 10));
    setStatutPresence("PRESENT");
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
      toast.success("Evaluation envoyee au responsable RH.");
      charger();
    } catch (err) {
      setErreur("Erreur lors de lenvoi de levaluation.");
    } finally {
      setEnCours(false);
    }
  }

  async function soumettrePresence(e) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);
    try {
      await api.post(`/stagiaires/${stagiaireAPointer.id}/presences`, {
        date: datePresence,
        statut: statutPresence,
      });
      setStagiaireAPointer(null);
      toast.success("Presence enregistree.");
      charger();
    } catch (err) {
      setErreur("Erreur lors de lenregistrement de la presence.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <p className="font-display font-bold text-mae-blue text-sm sm:text-base">MAE Assurances</p>
          <p className="text-xs text-slate-400">Espace tuteur</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline text-sm text-slate-600">{utilisateur?.prenom} {utilisateur?.nom}</span>
          <button onClick={handleDeconnexion} className="text-xs text-red-600 font-medium">
            Deconnexion
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <h1 className="font-display text-lg sm:text-xl font-bold text-mae-blue mb-6">Mes stagiaires</h1>

        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : stagiaires.length === 0 ? (
          <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-14 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Users2 size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Aucun stagiaire affecte</p>
            <p className="text-xs text-slate-400 mt-1">Les stagiaires que vous encadrez apparaitront ici.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stagiaires.map((s) => {
              const candidat = s.candidature?.candidat;
              const dejaEvalue = s.evaluations?.length > 0;
              return (
                <div key={s.id} className="bg-white border border-slate-200/70 rounded-2xl px-4 sm:px-5 py-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-mae-blue">{candidat?.prenom} {candidat?.nom}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {s.departement?.nom} - du {new Date(s.dateDebut).toLocaleDateString("fr-FR")} au {new Date(s.dateFin).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatutBadge statut={s.statut} />
                      <button
                        onClick={() => ouvrirFormulairePresence(s)}
                        className="text-xs text-mae-blue font-medium underline"
                      >
                        Pointer presence
                      </button>
                      <button
                        onClick={() => ouvrirFormulaireEvaluation(s)}
                        className="text-xs text-mae-teal font-medium underline"
                      >
                        {dejaEvalue ? "Evaluer a nouveau" : "Evaluer"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {stagiaireAPointer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={soumettrePresence} className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl animate-[slideIn_0.2s_ease-out]">
            <h2 className="font-display text-lg font-bold text-mae-blue mb-1">Pointer la presence</h2>
            <p className="text-sm text-slate-500 mb-4">
              {stagiaireAPointer.candidature?.candidat?.prenom} {stagiaireAPointer.candidature?.candidat?.nom}
            </p>

            {erreur && (
              <div className="mb-3 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">{erreur}</div>
            )}

            <label className="block text-sm text-slate-600 mb-1.5">Date</label>
            <input
              type="date"
              value={datePresence}
              onChange={(e) => setDatePresence(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-3 text-sm"
            />

            <label className="block text-sm text-slate-600 mb-1.5">Statut</label>
            <select
              value={statutPresence}
              onChange={(e) => setStatutPresence(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-4 text-sm"
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="RETARD">Retard</option>
              <option value="JUSTIFIE">Justifie</option>
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStagiaireAPointer(null)}
                className="flex-1 border border-slate-300 rounded-xl py-2.5 text-sm font-medium text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours}
                className="flex-1 bg-mae-blue text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {stagiaireAEvaluer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={soumettreEvaluation} className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl animate-[slideIn_0.2s_ease-out]">
            <h2 className="font-display text-lg font-bold text-mae-blue mb-1">Evaluer le stagiaire</h2>
            <p className="text-sm text-slate-500 mb-4">
              {stagiaireAEvaluer.candidature?.candidat?.prenom} {stagiaireAEvaluer.candidature?.candidat?.nom}
            </p>

            {erreur && (
              <div className="mb-3 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">{erreur}</div>
            )}

            <label className="block text-sm text-slate-600 mb-1.5">Note (sur 20)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-3 text-sm"
            />

            <label className="block text-sm text-slate-600 mb-1.5">Commentaire</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={4}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-4 text-sm"
              placeholder="Points forts, axes damelioration..."
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStagiaireAEvaluer(null)}
                className="flex-1 border border-slate-300 rounded-xl py-2.5 text-sm font-medium text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours}
                className="flex-1 bg-mae-blue text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
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
