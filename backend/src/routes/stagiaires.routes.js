import { Router } from "express";
import { z } from "zod";
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

const creationSchema = z.object({
  candidatureId: z.number(),
  departementId: z.number(),
  tuteurId: z.number(),
  dateDebut: z.string(),
  dateFin: z.string(),
});

router.post("/", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const parsed = creationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Donnees invalides.", erreurs: parsed.error.flatten() });
  }

  const { candidatureId, departementId, tuteurId, dateDebut, dateFin } = parsed.data;

  const stagiaire = await prisma.$transaction(async (tx) => {
    const nouveauStagiaire = await tx.stagiaire.create({
      data: {
        candidatureId,
        departementId,
        tuteurId,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        statut: calculerStatut(dateDebut, dateFin),
      },
    });

    await tx.candidature.update({
      where: { id: candidatureId },
      data: { statut: "ACCEPTEE" },
    });

    return nouveauStagiaire;
  });

  res.status(201).json(stagiaire);
});

router.get("/", requireAuth, async (req, res) => {
  const { departementId, statut } = req.query;

  const filtreTuteur = req.user.role === "TUTEUR" ? { tuteurId: req.user.id } : {};

  const stagiaires = await prisma.stagiaire.findMany({
    where: {
      departementId: departementId ? Number(departementId) : undefined,
      ...filtreTuteur,
    },
    include: {
      candidature: { include: { candidat: { select: { nom: true, prenom: true, email: true } } } },
      departement: true,
      tuteur: { select: { id: true, nom: true, prenom: true } },
      evaluations: { where: req.user.role === "TUTEUR" ? { tuteurId: req.user.id } : undefined },
    },
    orderBy: { dateDebut: "desc" },
  });

  const avecStatutRecalcule = stagiaires.map((s) => ({
    ...s,
    statut: calculerStatut(s.dateDebut, s.dateFin),
  }));

  const resultat = statut ? avecStatutRecalcule.filter((s) => s.statut === statut) : avecStatutRecalcule;

  res.json(resultat);
});

router.get("/:id", requireAuth, async (req, res) => {
  const stagiaire = await prisma.stagiaire.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      candidature: { include: { candidat: true, piecesJointes: true } },
      departement: true,
      tuteur: { select: { id: true, nom: true, prenom: true, email: true } },
      presences: { orderBy: { date: "desc" } },
      documents: true,
      evaluations: true,
    },
  });

  if (!stagiaire) {
    return res.status(404).json({ message: "Stagiaire introuvable." });
  }

  res.json({ ...stagiaire, statut: calculerStatut(stagiaire.dateDebut, stagiaire.dateFin) });
});

router.post("/:id/presences", requireAuth, requireRole("TUTEUR", "RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const { date, statut, heureArrivee, heureDepart } = req.body;

  const presence = await prisma.presence.upsert({
    where: {
      stagiaireId_date: { stagiaireId: Number(req.params.id), date: new Date(date) },
    },
    update: { statut, heureArrivee, heureDepart },
    create: {
      stagiaireId: Number(req.params.id),
      date: new Date(date),
      statut,
      heureArrivee,
      heureDepart,
    },
  });

  res.status(201).json(presence);
});

export default router;
