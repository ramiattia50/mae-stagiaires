import { Router } from "express";
import prisma from "../models/prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const [
    stagiairesActifs,
    candidaturesEnAttente,
    stagesAVenir,
    evaluationsEnAttente,
    parDepartement,
    parTypeStage,
  ] = await Promise.all([
    prisma.stagiaire.count({ where: { statut: "EN_COURS" } }),
    prisma.candidature.count({ where: { statut: { in: ["DEPOSEE", "EN_COURS_ETUDE"] } } }),
    prisma.stagiaire.count({ where: { statut: "A_VENIR" } }),
    prisma.evaluation.count({ where: { statutValidation: "EN_ATTENTE" } }),

    prisma.stagiaire.groupBy({
      by: ["departementId"],
      _count: { id: true },
    }),

    prisma.candidature.groupBy({
      by: ["typeStage"],
      _count: { id: true },
      where: { statut: "ACCEPTEE" },
    }),
  ]);

  const departements = await prisma.departement.findMany();
  const parDepartementNomme = parDepartement.map((entry) => ({
    departement: departements.find((d) => d.id === entry.departementId)?.nom ?? "Inconnu",
    nombre: entry._count.id,
  }));

  res.json({
    stagiairesActifs,
    candidaturesEnAttente,
    stagesAVenir,
    evaluationsEnAttente,
    parDepartement: parDepartementNomme,
    parTypeStage: parTypeStage.map((entry) => ({
      type: entry.typeStage,
      nombre: entry._count.id,
    })),
  });
});

export default router;
