import { Router } from "express";
import prisma from "../models/prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function calculerStatut(dateDebut, dateFin) {
  const maintenant = new Date();
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (maintenant < debut) return "A_VENIR";
  if (maintenant > fin) return "TERMINE";
  return "EN_COURS";
}

router.get("/stats", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const [tousLesStagiaires, candidaturesEnAttente, evaluationsEnAttente, departements, candidaturesAcceptees] = await Promise.all([
    prisma.stagiaire.findMany({ select: { id: true, dateDebut: true, dateFin: true, departementId: true } }),
    prisma.candidature.count({ where: { statut: { in: ["DEPOSEE", "EN_COURS_ETUDE"] } } }),
    prisma.evaluation.count({ where: { statutValidation: "EN_ATTENTE" } }),
    prisma.departement.findMany(),
    prisma.candidature.groupBy({
      by: ["typeStage"],
      _count: { id: true },
      where: { statut: "ACCEPTEE" },
    }),
  ]);

  const stagiairesAvecStatut = tousLesStagiaires.map((s) => ({
    ...s,
    statut: calculerStatut(s.dateDebut, s.dateFin),
  }));

  const stagiairesActifs = stagiairesAvecStatut.filter((s) => s.statut === "EN_COURS").length;
  const stagesAVenir = stagiairesAvecStatut.filter((s) => s.statut === "A_VENIR").length;

  const parDepartementNomme = departements.map((d) => ({
    departement: d.nom,
    nombre: stagiairesAvecStatut.filter((s) => s.departementId === d.id).length,
  })).filter((entry) => entry.nombre > 0);

  res.json({
    stagiairesActifs,
    candidaturesEnAttente,
    stagesAVenir,
    evaluationsEnAttente,
    parDepartement: parDepartementNomme,
    parTypeStage: candidaturesAcceptees.map((entry) => ({
      type: entry.typeStage,
      nombre: entry._count.id,
    })),
  });
});

export default router;
