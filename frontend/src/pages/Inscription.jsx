import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }
    setEnCours(true);
    try {
      await api.post("/auth/inscription", { nom, prenom, email, motDePasse, role: "CANDIDAT" });
      const res = await api.post("/auth/connexion", { email, motDePasse });
      window.localStorage.setItem("mae_token", res.data.token);
      window.localStorage.setItem("mae_utilisateur", JSON.stringify(res.data.utilisateur));
      navigate("/espace-candidat");
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Erreur lors de linscription.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 w-96">
        <h1 className="font-display text-xl font-bold text-mae-blue mb-1">MAE Assurances</h1>
        <p className="text-sm text-slate-500 mb-6">Creer un compte candidat</p>

        {erreur && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">{erreur}</div>
        )}

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-600 mb-1">Prenom</label>
            <input
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-600 mb-1">Nom</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <label className="block text-sm text-slate-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 text-sm"
          required
        />

        <label className="block text-sm text-slate-600 mb-1">Mot de passe</label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 text-sm"
          required
        />

        <button
          type="submit"
          disabled={enCours}
          className="w-full bg-mae-blue text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
        >
          Creer mon compte
        </button>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Deja un compte ? <Link to="/connexion" className="text-mae-teal font-medium">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
