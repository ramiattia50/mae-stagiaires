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
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 overflow-auto">
      <div className="mb-5">
        <h1 className="font-display text-xl lg:text-[22px] font-bold text-mae-blue">Departements</h1>
        <p className="text-sm text-slate-500 mt-0.5">{departements.length} departement(s)</p>
      </div>

      <form onSubmit={ajouterDepartement} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={nouveauNom}
          onChange={(e) => setNouveauNom(e.target.value)}
          placeholder="Nom du nouveau departement"
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm flex-1 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={enCours}
          className="bg-mae-blue text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          Ajouter
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departements.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-mae-teal/10 flex items-center justify-center">
                  <Building2 size={15} className="text-mae-teal" />
                </div>
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
