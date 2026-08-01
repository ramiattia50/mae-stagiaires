import { useEffect, useState } from "react";
import { Building2, Users } from "lucide-react";
import api from "../api/client";

export default function Departements() {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nouveauNom, setNouveauNom] = useState("");
  const [enCours, setEnCours] = useState(false);

  function charger() {
    setLoading(true);
    api.get("/departements").then((res) => setDepartements(res.data)).finally(() => setLoading(false));
  }

  useEffect(charger, []);

  async function ajouterDepartement(e) {
    e.preventDefault();
    if (!nouveauNom.trim()) return;
    setEnCours(true);
    try {
      await api.post("/departements", { nom: nouveauNom.trim() });
      setNouveauNom("");
      charger();
    } catch (err) {
      alert("Erreur lors de la creation du departement.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <main className="flex-1 px-8 py-7 overflow-auto">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-mae-blue">Departements</h1>
        <p className="text-sm text-slate-500 mt-0.5">{departements.length} departement(s)</p>
      </div>

      <form onSubmit={ajouterDepartement} className="flex gap-2 mb-6">
        <input
          type="text"
          value={nouveauNom}
          onChange={(e) => setNouveauNom(e.target.value)}
          placeholder="Nom du nouveau departement"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs"
        />
        <button
          type="submit"
          disabled={enCours}
          className="bg-mae-blue text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Chargement...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {departements.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-xl px-5 py-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-mae-teal" />
                <p className="font-display text-sm font-semibold text-mae-blue">{d.nom}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Users size={14} />
                {d._count?.stagiaires ?? 0} stagiaire(s)
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
