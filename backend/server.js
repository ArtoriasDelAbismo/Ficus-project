import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { modulos } from "./modulos.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(
  "/assets",
  express.static(path.join(__dirname, "../frontend/public/assets"))
);

app.get("/", (req, res) => {
  res.send("Server working correctly");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working correctly!" });
});

app.get("/api/modulos", (req, res) => {
  res.json(modulos);
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
