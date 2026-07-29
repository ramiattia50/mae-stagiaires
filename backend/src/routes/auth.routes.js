import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../models/prismaClient.js";
import { JWT_SECRET } from "../middleware/auth.js";

const router = Router();

const inscriptionSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email(),
  motDePasse: z.string().min(8),
  role: z.enum(["CANDIDAT", "TUTEUR", "RESPONSABLE_RH", "ADMIN"]).default("CANDIDAT"),
});

const connexionSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

router.post("/inscription", async (req, res) => {
  const parsed = inscriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Donnees invalides.", erreurs: parsed.error.flatten() });
  }

  const { nom, prenom, email, motDePasse, role } = parsed.data;

  const existant = await prisma.utilisateur.findUnique({ where: { email } });
  if (existant) {
    return res.status(409).json({ message: "Un compte existe deja avec cet email." });
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);

  const utilisateur = await prisma.utilisateur.create({
    data: { nom, prenom, email, motDePasseHash, role },
    select: { id: true, nom: true, prenom: true, email: true, role: true },
  });

  res.status(201).json(utilisateur);
});

router.post("/connexion", async (req, res) => {
  const parsed = connexionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Donnees invalides." });
  }

  const { email, motDePasse } = parsed.data;

  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
  if (!utilisateur || !utilisateur.actif) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);
  if (!motDePasseValide) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  const token = jwt.sign(
    { id: utilisateur.id, role: utilisateur.role, email: utilisateur.email },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    utilisateur: {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
    },
  });
});

export default router;
