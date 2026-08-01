import { Router } from "express";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import prisma from "../models/prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const DOSSIER_DOCUMENTS = path.resolve("uploads/documents");

function dessinerEntete(doc, titre) {
  doc.rect(0, 0, doc.page.width, 90).fill("#0B3D62");
  doc.fillColor("#FFFFFF").fontSize(18).font("Helvetica-Bold").text("MAE ASSURANCES", 50, 30);
  doc.fontSize(10).font("Helvetica").text("Pole Richesse Humaine", 50, 55);
  doc.fillColor("#0B3D62").fontSize(16).font("Helvetica-Bold").text(titre, 50, 115);
  doc.moveTo(50, 145).lineTo(545, 145).strokeColor("#E5E7EB").stroke();
  doc.fillColor("#000000");
}

function genererConventionPDF(stagiaire, cheminFichier) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(cheminFichier);
    doc.pipe(stream);

    dessinerEntete(doc, "Convention de Stage");

    const candidat = stagiaire.candidature?.candidat;
    doc.fontSize(11).font("Helvetica").moveDown(3);

    doc.font("Helvetica-Bold").text("Stagiaire : ", { continued: true });
    doc.font("Helvetica").text(`${candidat?.prenom} ${candidat?.nom}`);

    doc.font("Helvetica-Bold").text("Email : ", { continued: true });
    doc.font("Helvetica").text(candidat?.email ?? "-");

    doc.font("Helvetica-Bold").text("Departement daccueil : ", { continued: true });
    doc.font("Helvetica").text(stagiaire.departement?.nom ?? "-");

    doc.font("Helvetica-Bold").text("Tuteur : ", { continued: true });
    doc.font("Helvetica").text(`${stagiaire.tuteur?.prenom ?? ""} ${stagiaire.tuteur?.nom ?? ""}`);

    doc.font("Helvetica-Bold").text("Type de stage : ", { continued: true });
    doc.font("Helvetica").text(stagiaire.candidature?.typeStage ?? "-");

    doc.font("Helvetica-Bold").text("Periode : ", { continued: true });
    doc.font("Helvetica").text(
      `du ${new Date(stagiaire.dateDebut).toLocaleDateString("fr-FR")} au ${new Date(stagiaire.dateFin).toLocaleDateString("fr-FR")}`
    );

    doc.moveDown(2);
    doc.fontSize(10).fillColor("#475569").text(
      "La presente convention atteste de laccord entre MAE Assurances et le stagiaire mentionne ci-dessus, " +
      "pour la periode de stage indiquee, dans le cadre du departement precite.",
      { align: "justify" }
    );

    doc.moveDown(4);
    doc.fontSize(10).fillColor("#000000");
    doc.text("Signature du stagiaire", 50, doc.y, { width: 200 });
    doc.text("Signature du responsable RH", 300, doc.y - doc.currentLineHeight(), { width: 200 });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function genererAttestationPDF(stagiaire, cheminFichier) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(cheminFichier);
    doc.pipe(stream);

    dessinerEntete(doc, "Attestation de Stage");

    const candidat = stagiaire.candidature?.candidat;
    doc.fontSize(11).font("Helvetica").moveDown(3);

    doc.text(
      `Nous, MAE Assurances, certifions que ${candidat?.prenom} ${candidat?.nom} a effectue un stage ` +
      `au sein du departement ${stagiaire.departement?.nom ?? "-"}, du ` +
      `${new Date(stagiaire.dateDebut).toLocaleDateString("fr-FR")} au ${new Date(stagiaire.dateFin).toLocaleDateString("fr-FR")}, ` +
      `sous la supervision de ${stagiaire.tuteur?.prenom ?? ""} ${stagiaire.tuteur?.nom ?? ""}.`,
      { align: "justify" }
    );

    doc.moveDown(1.5);
    doc.text(
      "Cette attestation est delivree pour servir et valoir ce que de droit.",
      { align: "justify" }
    );

    doc.moveDown(4);
    doc.text(`Fait a Tunis, le ${new Date().toLocaleDateString("fr-FR")}`);
    doc.moveDown(2);
    doc.text("Le Responsable Richesse Humaine");

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

router.post("/:stagiaireId/convention", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const stagiaireId = Number(req.params.stagiaireId);

  const stagiaire = await prisma.stagiaire.findUnique({
    where: { id: stagiaireId },
    include: {
      candidature: { include: { candidat: true } },
      departement: true,
      tuteur: true,
    },
  });

  if (!stagiaire) {
    return res.status(404).json({ message: "Stagiaire introuvable." });
  }

  const nomFichier = `convention-${stagiaireId}-${Date.now()}.pdf`;
  const cheminFichier = path.join(DOSSIER_DOCUMENTS, nomFichier);

  await genererConventionPDF(stagiaire, cheminFichier);

  const document = await prisma.documentGenere.create({
    data: { type: "CONVENTION", cheminFichier: nomFichier, stagiaireId },
  });

  res.status(201).json(document);
});

router.post("/:stagiaireId/attestation", requireAuth, requireRole("RESPONSABLE_RH", "ADMIN"), async (req, res) => {
  const stagiaireId = Number(req.params.stagiaireId);

  const stagiaire = await prisma.stagiaire.findUnique({
    where: { id: stagiaireId },
    include: {
      candidature: { include: { candidat: true } },
      departement: true,
      tuteur: true,
    },
  });

  if (!stagiaire) {
    return res.status(404).json({ message: "Stagiaire introuvable." });
  }

  const nomFichier = `attestation-${stagiaireId}-${Date.now()}.pdf`;
  const cheminFichier = path.join(DOSSIER_DOCUMENTS, nomFichier);

  await genererAttestationPDF(stagiaire, cheminFichier);

  const document = await prisma.documentGenere.create({
    data: { type: "ATTESTATION", cheminFichier: nomFichier, stagiaireId },
  });

  res.status(201).json(document);
});

router.get("/download/:id", requireAuth, async (req, res) => {
  const document = await prisma.documentGenere.findUnique({ where: { id: Number(req.params.id) } });

  if (!document) {
    return res.status(404).json({ message: "Document introuvable." });
  }

  const cheminComplet = path.join(DOSSIER_DOCUMENTS, document.cheminFichier);
  res.download(cheminComplet, document.cheminFichier);
});

export default router;
