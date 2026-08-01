import { Router } from "express";
import prisma from "../models/prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/tuteurs", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const tuteurs = await prisma.utilisateur.findMany({
    where: { role: "TUTEUR", actif: true },
    select: { id: true, nom: true, prenom: true, email: true },
    orderBy: { nom: "asc" },
  });

  res.json(tuteurs);
});

export default router;
