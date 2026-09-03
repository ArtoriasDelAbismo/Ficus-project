import { randomUUID } from "crypto";
import { db } from "./database.js";

const rowToModulo = (row) => ({
  id: row.id,
  tipo: row.tipo,
  ancho: row.ancho,
  alto: row.alto,
  profundidad: row.profundidad,
  colores: JSON.parse(row.colores),
  materiales: JSON.parse(row.materiales),
  imagen: row.imagen,
});

export const listModulos = () => {
  const rows = db
    .prepare("SELECT * FROM modulos WHERE activo = 1 ORDER BY created_at ASC")
    .all();
  return rows.map(rowToModulo);
};

export const getModulo = (id) => {
  const row = db.prepare("SELECT * FROM modulos WHERE id = ?").get(id);
  return row ? rowToModulo(row) : null;
};

export const createModulo = ({
  id,
  tipo,
  ancho,
  alto,
  profundidad,
  colores = [],
  materiales = [],
  imagen = null,
}) => {
  const newId = id || randomUUID();
  db.prepare(
    `INSERT INTO modulos (id, tipo, ancho, alto, profundidad, colores, materiales, imagen)
     VALUES (@id, @tipo, @ancho, @alto, @profundidad, @colores, @materiales, @imagen)`
  ).run({
    id: newId,
    tipo,
    ancho,
    alto,
    profundidad,
    colores: JSON.stringify(colores),
    materiales: JSON.stringify(materiales),
    imagen,
  });
  return getModulo(newId);
};

export const updateModulo = (id, fields) => {
  const existing = db.prepare("SELECT * FROM modulos WHERE id = ?").get(id);
  if (!existing) return null;

  const merged = {
    tipo: fields.tipo ?? existing.tipo,
    ancho: fields.ancho ?? existing.ancho,
    alto: fields.alto ?? existing.alto,
    profundidad: fields.profundidad ?? existing.profundidad,
    colores: JSON.stringify(fields.colores ?? JSON.parse(existing.colores)),
    materiales: JSON.stringify(
      fields.materiales ?? JSON.parse(existing.materiales)
    ),
    imagen: fields.imagen ?? existing.imagen,
  };

  db.prepare(
    `UPDATE modulos SET
       tipo = @tipo, ancho = @ancho, alto = @alto, profundidad = @profundidad,
       colores = @colores, materiales = @materiales, imagen = @imagen,
       updated_at = datetime('now')
     WHERE id = @id`
  ).run({ id, ...merged });

  return getModulo(id);
};

// Soft delete: keeps history/referential integrity for designs that already
// placed this module, instead of hard-deleting rows.
export const deactivateModulo = (id) => {
  const result = db
    .prepare(
      "UPDATE modulos SET activo = 0, updated_at = datetime('now') WHERE id = ?"
    )
    .run(id);
  return result.changes > 0;
};
