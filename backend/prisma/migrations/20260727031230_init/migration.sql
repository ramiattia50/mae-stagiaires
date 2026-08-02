-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Candidature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateDepot" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'DEPOSEE',
    "typeStage" TEXT NOT NULL,
    "sujetStage" TEXT,
    "dateDebutSouhaitee" DATETIME NOT NULL,
    "dateFinSouhaitee" DATETIME NOT NULL,
    "candidatId" INTEGER NOT NULL,
    CONSTRAINT "Candidature_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PieceJointe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "cheminFichier" TEXT NOT NULL,
    "dateAjout" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidatureId" INTEGER NOT NULL,
    CONSTRAINT "PieceJointe_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "Candidature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Departement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Stagiaire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'A_VENIR',
    "candidatureId" INTEGER NOT NULL,
    "departementId" INTEGER NOT NULL,
    "tuteurId" INTEGER NOT NULL,
    CONSTRAINT "Stagiaire_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "Candidature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Stagiaire_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Stagiaire_tuteurId_fkey" FOREIGN KEY ("tuteurId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "statut" TEXT NOT NULL,
    "heureArrivee" TEXT,
    "heureDepart" TEXT,
    "stagiaireId" INTEGER NOT NULL,
    CONSTRAINT "Presence_stagiaireId_fkey" FOREIGN KEY ("stagiaireId") REFERENCES "Stagiaire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentGenere" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "cheminFichier" TEXT NOT NULL,
    "dateGeneration" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stagiaireId" INTEGER NOT NULL,
    CONSTRAINT "DocumentGenere_stagiaireId_fkey" FOREIGN KEY ("stagiaireId") REFERENCES "Stagiaire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateEvaluation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" REAL,
    "commentaire" TEXT,
    "statutValidation" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "dateValidation" DATETIME,
    "stagiaireId" INTEGER NOT NULL,
    "tuteurId" INTEGER NOT NULL,
    "responsableRHId" INTEGER,
    CONSTRAINT "Evaluation_stagiaireId_fkey" FOREIGN KEY ("stagiaireId") REFERENCES "Stagiaire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_tuteurId_fkey" FOREIGN KEY ("tuteurId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_responsableRHId_fkey" FOREIGN KEY ("responsableRHId") REFERENCES "Utilisateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Departement_nom_key" ON "Departement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Stagiaire_candidatureId_key" ON "Stagiaire"("candidatureId");

-- CreateIndex
CREATE UNIQUE INDEX "Presence_stagiaireId_date_key" ON "Presence"("stagiaireId", "date");
