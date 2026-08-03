import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";

const ROLE_LABELS = {
  RESPONSABLE_RH: "Responsable RH",
  TUTEUR: "Tuteur",
  CANDIDAT: "Candidat",
  ADMIN: "Administrateur",
};

export default function UserMenu() {
  const [ouvert, setOuvert] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const utilisateurBrut = window.localStorage.getItem("mae_utilisateur");
  const utilisateur = utilisateurBrut ? JSON.parse(utilisateurBrut) : null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleDeconnexion() {
    window.localStorage.removeItem("mae_token");
    window.localStorage.removeItem("mae_utilisateur");
    navigate("/connexion");
  }

  if (!utilisateur) return null;

  const initiales = `${utilisateur.prenom?.[0] ?? ""}${utilisateur.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOuvert((v) => !v)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-mae-teal text-white flex items-center justify-center text-xs font-semibold font-display shadow-sm">
          {initiales}
        </div>
        <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
      </button>

      {ouvert && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-sm font-medium text-mae-blue">
              {utilisateur.prenom} {utilisateur.nom}
            </p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[utilisateur.role] ?? utilisateur.role}</p>
          </div>
          <button
            onClick={handleDeconnexion}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
          >
            <LogOut size={14} />
            Se deconnecter
          </button>
        </div>
      )}
    </div>
  );
}
