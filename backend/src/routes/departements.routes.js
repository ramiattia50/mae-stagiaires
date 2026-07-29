import { Router } from "express";
import prisma from "../models/prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const departements = await prisma.departement.findMany({
    include: { _count: { select: { stagiaires: true } } },
    orderBy: { nom: "asc" },
  });

  res.json(departements);
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { nom, description } = req.body;

  if (!nom) {
    return res.status(400).json({ message: "Le nom du departement est requis." });
  }

  const departement = await prisma.departement.create({ data: { nom, description } });
  res.status(201).json(departement);
});

export default router;
