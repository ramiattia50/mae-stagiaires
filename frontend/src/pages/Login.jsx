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

      if (res.data.utilisateur.role === "CANDIDAT") {
        navigate("/espace-candidat");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErreur("Identifiants incorrects ou serveur indisponible.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 w-96">
        <h1 className="font-display text-xl font-bold text-mae-blue mb-1">MAE Assurances</h1>
        <p className="text-sm text-slate-500 mb-6">Connexion</p>

        {erreur && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">{erreur}</div>
        )}

        <label className="block text-sm text-slate-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-sm text-slate-600 mb-1">Mot de passe</label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 text-sm"
        />

        <button
          type="submit"
          className="w-full bg-mae-blue text-white rounded-lg py-2.5 text-sm font-medium"
        >
          Se connecter
        </button>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Pas encore de compte ? <Link to="/inscription" className="text-mae-teal font-medium">Creer un compte candidat</Link>
        </p>
      </form>
    </div>
  );
}
