import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import UserMenu from "./components/UserMenu";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import EspaceCandidat from "./pages/EspaceCandidat";
import EspaceTuteur from "./pages/EspaceTuteur";
import Stagiaires from "./pages/Stagiaires";
import StagiaireFiche from "./pages/StagiaireFiche";
import Candidatures from "./pages/Candidatures";
import Departements from "./pages/Departements";
import Evaluations from "./pages/Evaluations";

function getUtilisateur() {
  const brut = window.localStorage.getItem("mae_utilisateur");
  return brut ? JSON.parse(brut) : null;
}

function RequireAuth({ children }) {
  const token = window.localStorage.getItem("mae_token");
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
}

function RequireRH({ children }) {
  const utilisateur = getUtilisateur();
  if (!utilisateur || !["RESPONSABLE_RH", "ADMIN"].includes(utilisateur.role)) {
    if (utilisateur?.role === "TUTEUR") return <Navigate to="/espace-tuteur" replace />;
    return <Navigate to="/espace-candidat" replace />;
  }
  return children;
}

function RHLayout({ children }) {
  const [drawerOuvert, setDrawerOuvert] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar open={drawerOuvert} onClose={() => setDrawerOuvert(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
          <button onClick={() => setDrawerOuvert(true)} className="p-1.5 text-mae-blue">
            <Menu size={22} />
          </button>
          <span className="font-display font-bold text-sm text-mae-blue">MAE Assurances</span>
          <UserMenu />
        </header>

        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />

      <Route
        path="/espace-candidat"
        element={
          <RequireAuth>
            <EspaceCandidat />
          </RequireAuth>
        }
      />

      <Route
        path="/espace-tuteur"
        element={
          <RequireAuth>
            <EspaceTuteur />
          </RequireAuth>
        }
      />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <RequireRH>
              <RHLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/candidatures" element={<Candidatures />} />
                  <Route path="/stagiaires" element={<Stagiaires />} />
                  <Route path="/stagiaires/:id" element={<StagiaireFiche />} />
                  <Route path="/evaluations" element={<Evaluations />} />
                  <Route path="/departements" element={<Departements />} />
                </Routes>
              </RHLayout>
            </RequireRH>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
