import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Stagiaires from "./pages/Stagiaires";
import StagiaireFiche from "./pages/StagiaireFiche";
import Candidatures from "./pages/Candidatures";

function PagePlaceholder({ titre }) {
  return (
    <main className="flex-1 px-8 py-7">
      <h1 className="font-display text-[22px] font-bold text-mae-blue">{titre}</h1>
      <p className="text-sm text-slate-500 mt-2">Module en construction.</p>
    </main>
  );
}

function RequireAuth({ children }) {
  const token = window.localStorage.getItem("mae_token");
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div className="flex min-h-screen bg-[#F7F8FA]">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/candidatures" element={<Candidatures />} />
                <Route path="/stagiaires" element={<Stagiaires />} />
                <Route path="/stagiaires/:id" element={<StagiaireFiche />} />
                <Route path="/evaluations" element={<PagePlaceholder titre="Evaluations" />} />
                <Route path="/departements" element={<PagePlaceholder titre="Departements" />} />
              </Routes>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
