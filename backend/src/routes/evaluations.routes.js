import { Router } from "express";
import { z } from "zod";
import prisma from "../models/prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const evaluationSchema = z.object({
  stagiaireId: z.number(),
  note: z.number().min(0).max(20),
  commentaire: z.string().optional(),
});

router.post("/", requireAuth, requireRole("TUTEUR"), async (req, res) => {
  const parsed = evaluationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Donnees invalides.", erreurs: parsed.error.flatten() });
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      ...parsed.data,
      tuteurId: req.user.id,
    },
  });

  res.status(201).json(evaluation);
});

router.get("/", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const { statutValidation } = req.query;

  const evaluations = await prisma.evaluation.findMany({
    where: statutValidation ? { statutValidation } : undefined,
    include: {
      stagiaire: {
        include: { candidature: { include: { candidat: true } }, departement: true },
      },
      tuteur: { select: { nom: true, prenom: true } },
    },
    orderBy: { dateEvaluation: "desc" },
  });

  res.json(evaluations);
});

router.patch("/:id/validation", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const { statutValidation } = req.body;
  const statutsValides = ["VALIDEE", "REJETEE_POUR_REVISION"];

  if (!statutsValides.includes(statutValidation)) {
    return res.status(400).json({ message: "Statut de validation invalide." });
  }

  const evaluation = await prisma.evaluation.update({
    where: { id: Number(req.params.id) },
    data: {
      statutValidation,
      dateValidation: new Date(),
      responsableRHId: req.user.id,
    },
  });

  res.json(evaluation);
});

router.get("/historique/:stagiaireId", requireAuth, async (req, res) => {
  const evaluations = await prisma.evaluation.findMany({
    where: { stagiaireId: Number(req.params.stagiaireId) },
    include: { tuteur: { select: { nom: true, prenom: true } } },
    orderBy: { dateEvaluation: "asc" },
  });

  res.json(evaluations);
});

export default router;
