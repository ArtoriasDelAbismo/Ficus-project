// Minimal write-protection: a single shared secret checked against an
// 'x-admin-key' header. This is NOT proper multi-user auth (no accounts,
// no roles, no expiry) — it only stops a random visitor from hitting the
// write endpoints. Replace with real auth before this is exposed beyond
// the furniture company's own staff.
export const requireAdminKey = (req, res, next) => {
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    console.warn(
      "ADMIN_API_KEY no está configurada: los endpoints de escritura de módulos están abiertos a cualquiera. Configurá ADMIN_API_KEY en el .env antes de desplegar."
    );
    return next();
  }

  const provided = req.get("x-admin-key");
  if (provided !== expected) {
    return res.status(401).json({ error: "Admin key inválida o ausente" });
  }
  next();
};
