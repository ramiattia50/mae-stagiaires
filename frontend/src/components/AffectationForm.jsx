import { useEffect, useState } from "react";
import api from "../api/client";

export default function AffectationForm({ candidature, onClose, onSuccess }) {
  const [departements, setDepartements] = useState([]);
  const [tuteurs, setTuteurs] = useState([]);
  const [departementId, setDepartementId] = useState("");
  const [tuteurId, setTuteurId] = useState("");
  const [dateDebut, setDateDebut] = useState(candidature.dateDebutSouhaitee?.slice(0, 10) ?? "");
  const [dateFin, setDateFin] = useState(candidature.dateFinSouhaitee?.slice(0, 10) ?? "");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/departements").then((res) => setDepartements(res.data));
    api.get("/utilisateurs/tuteurs").then((res) => setTuteurs(res.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (!departementId || !tuteurId || !dateDebut || !dateFin) {
      setErreur("Tous les champs sont requis.");
      return;
    }
    setEnCours(true);
    try {
      await api.post("/stagiaires", {
        candidatureId: candidature.id,
        departementId: Number(departementId),
        tuteurId: Number(tuteurId),
        dateDebut,
        dateFin,
      });
      onSuccess();
    } catch (err) {
      setErreur("Erreur lors de laffectation. Le stagiaire existe peut-etre deja.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl">
        <h2 className="font-display text-lg font-bold text-mae-blue mb-1">Affecter le stagiaire</h2>
        <p className="text-sm text-slate-500 mb-4">
          {candidature.candidat?.prenom} {candidature.candidat?.nom}
        </p>

        {erreur && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">{erreur}</div>
        )}

        <label className="block text-sm text-slate-600 mb-1.5">Departement</label>
        <select
          value={departementId}
          onChange={(e) => setDepartementId(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-3 text-sm"
        >
          <option value="">Choisir...</option>
          {departements.map((d) => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </select>

        <label className="block text-sm text-slate-600 mb-1.5">Tuteur</label>
        <select
          value={tuteurId}
          onChange={(e) => setTuteurId(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-3 text-sm"
        >
          <option value="">Choisir...</option>
          {tuteurs.map((t) => (
            <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
          ))}
        </select>

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-600 mb-1.5">Debut</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-600 mb-1.5">Fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-300 rounded-xl py-2.5 text-sm font-medium text-slate-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={enCours}
            className="flex-1 bg-mae-blue text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            Confirmer
          </button>
        </div>
      </form>
    </div>
  );
}
