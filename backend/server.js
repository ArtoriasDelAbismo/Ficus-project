import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { modulosRouter } from "./routes/modulos.routes.js";
import { uploadsDir } from "./middleware/upload.js";
import "./db/database.js"; // ensures DB file + schema + seed exist on boot

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Legacy static images that ship with the frontend (seed data references these)
app.use(
  "/assets",
  express.static(path.join(__dirname, "../frontend/public/assets"))
);

// Images uploaded through the admin API for new/updated módulos
app.use("/uploads/modulos", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("Server working correctly");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working correctly!" });
});

app.use("/api/modulos", modulosRouter);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
