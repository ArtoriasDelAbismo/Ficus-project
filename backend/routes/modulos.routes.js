import { Router } from "express";
import path from "path";
import fs from "fs";
import {
  listModulos,
  getModulo,
  createModulo,
  updateModulo,
  deactivateModulo,
} from "../db/modulos.repo.js";
import { requireAdminKey } from "../middleware/adminAuth.js";
import { uploadModuloImage, uploadsDir } from "../middleware/upload.js";

export const modulosRouter = Router();

const withFullImageUrl = (req, modulo) => {
  if (!modulo.imagen) return modulo;
  if (/^https?:\/\//i.test(modulo.imagen)) return modulo; // already absolute
  return { ...modulo, imagen: `${req.protocol}://${req.get("host")}${modulo.imagen}` };
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall back to comma-separated string, e.g. "blanco,gris"
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const validateModuloPayload = (body, { partial = false } = {}) => {
  const errors = [];
  const numericFields = ["ancho", "alto", "profundidad"];

  if (!partial || body.tipo !== undefined) {
    if (!body.tipo || typeof body.tipo !== "string") {
      errors.push("'tipo' es obligatorio y debe ser texto");
    }
  }

  for (const field of numericFields) {
    if (!partial || body[field] !== undefined) {
      const value = Number(body[field]);
      if (!Number.isFinite(value) || value <= 0) {
        errors.push(`'${field}' debe ser un número mayor a 0`);
      }
    }
  }

  return errors;
};

// GET /api/modulos - catálogo público (solo activos)
modulosRouter.get("/", (req, res) => {
  const modulos = listModulos().map((m) => withFullImageUrl(req, m));
  res.json(modulos);
});

// GET /api/modulos/:id
modulosRouter.get("/:id", (req, res) => {
  const modulo = getModulo(req.params.id);
  if (!modulo) return res.status(404).json({ error: "Módulo no encontrado" });
  res.json(withFullImageUrl(req, modulo));
});

// POST /api/modulos - crear módulo (admin). Acepta multipart/form-data con
// campo 'imagen' opcional, o JSON puro sin imagen.
modulosRouter.post("/", requireAdminKey, (req, res) => {
  uploadModuloImage(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const errors = validateModuloPayload(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const imagen = req.file
      ? `/uploads/modulos/${req.file.filename}`
      : req.body.imagen || null;

    const modulo = createModulo({
      id: req.body.id,
      tipo: req.body.tipo,
      ancho: Number(req.body.ancho),
      alto: Number(req.body.alto),
      profundidad: Number(req.body.profundidad),
      colores: parseArrayField(req.body.colores),
      materiales: parseArrayField(req.body.materiales),
      imagen,
    });

    res.status(201).json(withFullImageUrl(req, modulo));
  });
});

// PUT /api/modulos/:id - editar módulo (admin), misma lógica de imagen que POST
modulosRouter.put("/:id", requireAdminKey, (req, res) => {
  uploadModuloImage(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const existing = getModulo(req.params.id);
    if (!existing) return res.status(404).json({ error: "Módulo no encontrado" });

    const errors = validateModuloPayload(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const previousImagePath = existing.imagen?.startsWith("/uploads/modulos/")
      ? path.join(uploadsDir, path.basename(existing.imagen))
      : null;

    const imagen = req.file
      ? `/uploads/modulos/${req.file.filename}`
      : req.body.imagen ?? undefined; // undefined => keep existing in repo layer

    const fields = {
      tipo: req.body.tipo,
      ancho: req.body.ancho !== undefined ? Number(req.body.ancho) : undefined,
      alto: req.body.alto !== undefined ? Number(req.body.alto) : undefined,
      profundidad:
        req.body.profundidad !== undefined ? Number(req.body.profundidad) : undefined,
      colores: req.body.colores !== undefined ? parseArrayField(req.body.colores) : undefined,
      materiales:
        req.body.materiales !== undefined ? parseArrayField(req.body.materiales) : undefined,
      imagen,
    };
    // strip undefined so repo's ?? fallback to existing works
    Object.keys(fields).forEach((k) => fields[k] === undefined && delete fields[k]);

    const updated = updateModulo(req.params.id, fields);

    if (req.file && previousImagePath && fs.existsSync(previousImagePath)) {
      fs.unlink(previousImagePath, () => {});
    }

    res.json(withFullImageUrl(req, updated));
  });
});

// DELETE /api/modulos/:id - baja lógica (admin). No borra el registro para
// no romper diseños ya guardados que referencian este módulo.
modulosRouter.delete("/:id", requireAdminKey, (req, res) => {
  const ok = deactivateModulo(req.params.id);
  if (!ok) return res.status(404).json({ error: "Módulo no encontrado" });
  res.status(204).send();
});
