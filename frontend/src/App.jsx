import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import EspaceCandidat from "./pages/EspaceCandidat";
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
    return <Navigate to="/espace-candidat" replace />;
  }
  return children;
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
        path="/*"
        element={
          <RequireAuth>
            <RequireRH>
              <div className="flex min-h-screen bg-[#F7F8FA]">
                <Sidebar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/candidatures" element={<Candidatures />} />
                  <Route path="/stagiaires" element={<Stagiaires />} />
                  <Route path="/stagiaires/:id" element={<StagiaireFiche />} />
                  <Route path="/evaluations" element={<Evaluations />} />
                  <Route path="/departements" element={<Departements />} />
                </Routes>
              </div>
            </RequireRH>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
