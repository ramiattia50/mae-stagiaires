import { Router } from "express";
import { z } from "zod";
import prisma from "../models/prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const candidatureSchema = z.object({
  typeStage: z.enum(["PFE", "STAGE_ETE", "STAGE_OBSERVATION", "ALTERNANCE"]),
  sujetStage: z.string().optional(),
  dateDebutSouhaitee: z.string(),
  dateFinSouhaitee: z.string(),
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = candidatureSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Donnees invalides.", erreurs: parsed.error.flatten() });
  }

  const candidature = await prisma.candidature.create({
    data: {
      ...parsed.data,
      dateDebutSouhaitee: new Date(parsed.data.dateDebutSouhaitee),
      dateFinSouhaitee: new Date(parsed.data.dateFinSouhaitee),
      candidatId: req.user.id,
    },
  });

  res.status(201).json(candidature);
});

router.get("/", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const { statut } = req.query;

  const candidatures = await prisma.candidature.findMany({
    where: statut ? { statut } : undefined,
    include: {
      candidat: { select: { nom: true, prenom: true, email: true } },
      piecesJointes: true,
    },
    orderBy: { dateDepot: "desc" },
  });

  res.json(candidatures);
});

router.get("/mes-candidatures", requireAuth, async (req, res) => {
  const candidatures = await prisma.candidature.findMany({
    where: { candidatId: req.user.id },
    include: { piecesJointes: true },
    orderBy: { dateDepot: "desc" },
  });

  res.json(candidatures);
});

router.patch("/:id/statut", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const { statut } = req.body;
  const statutsValides = ["EN_COURS_ETUDE", "ACCEPTEE", "REFUSEE"];

  if (!statutsValides.includes(statut)) {
    return res.status(400).json({ message: "Statut invalide." });
  }

  const candidature = await prisma.candidature.update({
    where: { id: Number(req.params.id) },
    data: { statut },
  });

  res.json(candidature);
});

export default router;
