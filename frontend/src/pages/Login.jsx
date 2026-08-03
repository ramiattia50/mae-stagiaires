import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("rh@mae.tn");
  const [motDePasse, setMotDePasse] = useState("motdepasse123");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    try {
      const res = await api.post("/auth/connexion", { email, motDePasse });
      window.localStorage.setItem("mae_token", res.data.token);
      window.localStorage.setItem("mae_utilisateur", JSON.stringify(res.data.utilisateur));

      const role = res.data.utilisateur.role;
      if (role === "CANDIDAT") {
        navigate("/espace-candidat");
      } else if (role === "TUTEUR") {
        navigate("/espace-tuteur");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErreur("Identifiants incorrects ou serveur indisponible.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/70 rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-mae-blue flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-xs text-white">MAE</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-mae-blue leading-tight">MAE Assurances</h1>
            <p className="text-xs text-slate-500">Connexion</p>
          </div>
        </div>

        {erreur && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">{erreur}</div>
        )}

        <label className="block text-sm text-slate-600 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-mae-teal/40 focus:border-mae-teal transition-shadow"
        />

        <label className="block text-sm text-slate-600 mb-1.5">Mot de passe</label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-mae-teal/40 focus:border-mae-teal transition-shadow"
        />

        <button
          type="submit"
          className="w-full bg-mae-blue text-white rounded-xl py-2.5 text-sm font-medium hover:bg-mae-blue/90 active:scale-[0.98] transition-all"
        >
          Se connecter
        </button>

        <p className="text-xs text-slate-500 mt-5 text-center">
          Pas encore de compte ? <Link to="/inscription" className="text-mae-teal font-medium">Creer un compte candidat</Link>
        </p>
      </form>
    </div>
  );
}
