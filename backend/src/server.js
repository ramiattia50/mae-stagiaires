import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import candidaturesRoutes from "./routes/candidatures.routes.js";
import stagiairesRoutes from "./routes/stagiaires.routes.js";
import evaluationsRoutes from "./routes/evaluations.routes.js";
import departementsRoutes from "./routes/departements.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import utilisateursRoutes from "./routes/utilisateurs.routes.js";
import documentsRoutes from "./routes/documents.routes.js";
import piecesJointesRoutes from "./routes/piecesJointes.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "mae-stagiaires-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/candidatures", candidaturesRoutes);
app.use("/api/stagiaires", stagiairesRoutes);
app.use("/api/evaluations", evaluationsRoutes);
app.use("/api/departements", departementsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/utilisateurs", utilisateursRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/pieces-jointes", piecesJointesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`API MAE Stagiaires en ecoute sur http://localhost:${PORT}`);
});
