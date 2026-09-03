import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "ficus.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS modulos (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    ancho REAL NOT NULL,
    alto REAL NOT NULL,
    profundidad REAL NOT NULL,
    colores TEXT NOT NULL DEFAULT '[]',
    materiales TEXT NOT NULL DEFAULT '[]',
    imagen TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const seedIfEmpty = () => {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM modulos").get();
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO modulos (id, tipo, ancho, alto, profundidad, colores, materiales, imagen)
    VALUES (@id, @tipo, @ancho, @alto, @profundidad, @colores, @materiales, @imagen)
  `);

  const seed = [
    {
      id: "A60",
      tipo: "Alacena",
      ancho: 120,
      alto: 60,
      profundidad: 40,
      colores: JSON.stringify(["blanco", "roble", "gris"]),
      materiales: JSON.stringify(["melamina", "MDF"]),
      imagen: "/assets/images/AL.png",
    },
    {
      id: "BM120",
      tipo: "Bajomesada",
      ancho: 120,
      alto: 90,
      profundidad: 60,
      colores: JSON.stringify(["blanco", "gris"]),
      materiales: JSON.stringify(["melamina", "MDF"]),
      imagen: "/assets/images/BM.png",
    },
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(seed);
};

seedIfEmpty();
