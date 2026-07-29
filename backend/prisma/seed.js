import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Peuplement de la base de donnees...");

  const motDePasseHash = await bcrypt.hash("motdepasse123", 10);

  const departements = await Promise.all(
    ["IT", "Finance", "Ressources Humaines", "Marketing", "Actuariat"].map((nom) =>
      prisma.departement.create({ data: { nom } })
    )
  );

  const rh = await prisma.utilisateur.create({
    data: {
      nom: "Ben Salah",
      prenom: "Nadia",
      email: "rh@mae.tn",
      motDePasseHash,
      role: "RESPONSABLE_RH",
    },
  });

  const tuteur = await prisma.utilisateur.create({
    data: {
      nom: "Ferjani",
      prenom: "Karim",
      email: "karim.ferjani@mae.tn",
      motDePasseHash,
      role: "TUTEUR",
    },
  });

  const candidat = await prisma.utilisateur.create({
    data: {
      nom: "Bouzid",
      prenom: "Ines",
      email: "ines.bouzid@example.com",
      motDePasseHash,
      role: "CANDIDAT",
    },
  });

  const candidature = await prisma.candidature.create({
    data: {
      candidatId: candidat.id,
      typeStage: "PFE",
      sujetStage: "Application de gestion des stagiaires",
      dateDebutSouhaitee: new Date("2026-07-01"),
      dateFinSouhaitee: new Date("2026-12-31"),
      statut: "ACCEPTEE",
    },
  });

  await prisma.stagiaire.create({
    data: {
      candidatureId: candidature.id,
      departementId: departements[0].id,
      tuteurId: tuteur.id,
      dateDebut: new Date("2026-07-01"),
      dateFin: new Date("2026-12-31"),
      statut: "EN_COURS",
    },
  });

  console.log("Base peuplee avec succes.");
  console.log("Compte RH de demo : rh@mae.tn / motdepasse123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
