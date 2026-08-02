import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../models/prismaClient.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const DOSSIER_PIECES = path.resolve("uploads/pieces-jointes");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOSSIER_PIECES),
  filename: (req, file, cb) => {
    const suffixe = Date.now();
    cb(null, `${suffixe}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const typesAutorises = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!typesAutorises.includes(ext)) {
      return cb(new Error("Format non autorise. Utilisez PDF, DOC ou DOCX."));
    }
    cb(null, true);
  },
});

router.post(
  "/:candidatureId",
  requireAuth,
  upload.single("fichier"),
  async (req, res) => {
    const candidatureId = Number(req.params.candidatureId);
    const { type } = req.body;

    const typesValides = ["CV", "LETTRE_MOTIVATION", "CONVENTION_SIGNEE"];
    if (!typesValides.includes(type)) {
      return res.status(400).json({ message: "Type de piece jointe invalide." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier recu." });
    }

    const candidature = await prisma.candidature.findUnique({ where: { id: candidatureId } });
    if (!candidature) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }
    if (candidature.candidatId !== req.user.id) {
      return res.status(403).json({ message: "Acces refuse." });
    }

    const pieceJointe = await prisma.pieceJointe.create({
      data: {
        type,
        cheminFichier: req.file.filename,
        candidatureId,
      },
    });

    res.status(201).json(pieceJointe);
  }
);

router.get("/download/:id", requireAuth, async (req, res) => {
  const piece = await prisma.pieceJointe.findUnique({ where: { id: Number(req.params.id) } });

  if (!piece) {
    return res.status(404).json({ message: "Piece jointe introuvable." });
  }

  const cheminComplet = path.join(DOSSIER_PIECES, piece.cheminFichier);
  res.download(cheminComplet, piece.cheminFichier);
});

router.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

export default router;
