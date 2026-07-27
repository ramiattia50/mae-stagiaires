import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function PagePlaceholder({ titre }) {
  return (
    <main className="flex-1 px-8 py-7">
      <h1 className="font-display text-[22px] font-bold text-mae-blue">{titre}</h1>
      <p className="text-sm text-slate-500 mt-2">Module en construction.</p>
    </main>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidatures" element={<PagePlaceholder titre="Candidatures" />} />
        <Route path="/stagiaires" element={<PagePlaceholder titre="Stagiaires" />} />
        <Route path="/evaluations" element={<PagePlaceholder titre="Évaluations" />} />
        <Route path="/departements" element={<PagePlaceholder titre="Départements" />} />
      </Routes>
    </div>
  );
}
