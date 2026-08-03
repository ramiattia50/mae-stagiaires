import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Building2, User, Calendar, FileText, Download } from "lucide-react";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";

export default function StagiaireFiche() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stagiaire, setStagiaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [generationEnCours, setGenerationEnCours] = useState(null);

  function charger() {
    api
      .get(`/stagiaires/${id}`)
      .then((res) => setStagiaire(res.data))
      .catch(() => setErreur("Impossible de charger ce stagiaire."))
      .finally(() => setLoading(false));
  }

  useEffect(charger, [id]);

  async function genererDocument(type) {
    setGenerationEnCours(type);
    try {
      await api.post(`/documents/${id}/${type}`);
      charger();
    } catch (err) {
      alert("Erreur lors de la generation du document.");
    } finally {
      setGenerationEnCours(null);
    }
  }

  async function telecharger(documentId, nomFichier) {
    const res = await api.get(`/documents/download/${documentId}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const lien = document.createElement("a");
    lien.href = url;
    lien.setAttribute("download", nomFichier);
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
  }

  if (loading) {
    return <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6"><p className="text-sm text-slate-400">Chargement...</p></main>;
  }

  if (erreur || !stagiaire) {
    return <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6"><p className="text-sm text-red-600">{erreur ?? "Stagiaire introuvable."}</p></main>;
  }

  const candidat = stagiaire.candidature?.candidat;
  const conventionExiste = stagiaire.documents?.some((d) => d.type === "CONVENTION");
  const attestationExiste = stagiaire.documents?.some((d) => d.type === "ATTESTATION");

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 overflow-auto">
      <button
        onClick={() => navigate("/stagiaires")}
        className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 hover:text-mae-blue transition-colors"
      >
        <ArrowLeft size={15} /> Retour a la liste
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-mae-blue">
            {candidat?.prenom} {candidat?.nom}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{stagiaire.candidature?.sujetStage}</p>
        </div>
        <StatutBadge statut={stagiaire.statut} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Informations</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Mail size={15} className="text-slate-400 shrink-0" /> <span className="break-all">{candidat?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Building2 size={15} className="text-slate-400 shrink-0" /> {stagiaire.departement?.nom}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <User size={15} className="text-slate-400 shrink-0" /> Tuteur : {stagiaire.tuteur?.prenom} {stagiaire.tuteur?.nom}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Calendar size={15} className="text-slate-400 shrink-0" />
              {new Date(stagiaire.dateDebut).toLocaleDateString("fr-FR")} au {new Date(stagiaire.dateFin).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Documents</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-600">Convention de stage</span>
              <button
                disabled={generationEnCours === "convention"}
                onClick={() => genererDocument("convention")}
                className="text-xs text-mae-teal font-medium flex items-center gap-1 disabled:opacity-50 shrink-0"
              >
                <FileText size={13} /> {conventionExiste ? "Regenerer" : "Generer"}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-600">Attestation de stage</span>
              <button
                disabled={generationEnCours === "attestation"}
                onClick={() => genererDocument("attestation")}
                className="text-xs text-mae-teal font-medium flex items-center gap-1 disabled:opacity-50 shrink-0"
              >
                <FileText size={13} /> {attestationExiste ? "Regenerer" : "Generer"}
              </button>
            </div>

            {stagiaire.documents?.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {stagiaire.documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">
                      {d.type === "CONVENTION" ? "Convention" : "Attestation"} - {new Date(d.dateGeneration).toLocaleDateString("fr-FR")}
                    </span>
                    <button
                      onClick={() => telecharger(d.id, d.cheminFichier)}
                      className="text-xs text-mae-blue font-medium flex items-center gap-1 shrink-0"
                    >
                      <Download size={12} /> Telecharger
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Evaluations</p>
          {stagiaire.evaluations?.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune evaluation pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {stagiaire.evaluations.map((e) => (
                <div key={e.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-600">{new Date(e.dateEvaluation).toLocaleDateString("fr-FR")}</span>
                  <span className="font-medium text-mae-blue">{e.note ?? "-"} / 20</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
          <p className="font-display text-sm font-semibold text-mae-blue mb-4">Historique de presence</p>
          {stagiaire.presences?.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune presence enregistree.</p>
          ) : (
            <div className="space-y-2">
              {stagiaire.presences.slice(0, 5).map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-600">{new Date(p.date).toLocaleDateString("fr-FR")}</span>
                  <span className="text-slate-500">{p.statut}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
