const bcrypt = require("bcryptjs");
const {
  getSupabase,
  signToken,
  normalizeIdentifier,
  isValidEmail,
  isValidUsername,
  setCors,
} = require("../_lib");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  try {
    const body = req.body || {};
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const username = String(body.username || "").trim();
    const alias = String(body.alias || "").trim();
    const email = normalizeIdentifier(body.email);
    const password = String(body.password || "");
    // The browser uploads the photo directly to Supabase Storage (Vercel's
    // 4.5MB function body limit makes base64 upload through this API a bad
    // fit) and passes us only the resulting public URL.
    const photoUrl = body.photoUrl ? String(body.photoUrl).trim() : null;

    // ── Validation ──
    if (!firstName || !lastName) {
      return res.status(422).json({ error: "Nombre y apellido son requeridos." });
    }
    if (!isValidUsername(username)) {
      return res.status(422).json({
        error: "El nombre de usuario debe tener entre 3 y 24 caracteres (letras, números o guion bajo).",
      });
    }
    if (alias && !isValidUsername(alias)) {
      return res.status(422).json({
        error: "El alias debe tener entre 3 y 24 caracteres (letras, números o guion bajo).",
      });
    }
    if (!isValidEmail(email)) {
      return res.status(422).json({ error: "Ingresa un correo electrónico válido." });
    }
    if (password.length < 6) {
      return res.status(422).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const supabase = getSupabase();

    // ── Uniqueness checks (username, alias, email) ──
    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("id, username, alias, email")
      .or(
        [
          `username.ilike.${username}`,
          `email.ilike.${email}`,
          alias ? `alias.ilike.${alias}` : null,
        ]
          .filter(Boolean)
          .join(",")
      );

    if (lookupError) throw lookupError;
    if (existing && existing.length > 0) {
      const clash = existing[0];
      if (clash.email && clash.email.toLowerCase() === email) {
        return res.status(409).json({ error: "Ese correo ya está registrado." });
      }
      if (clash.username && clash.username.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({ error: "Ese nombre de usuario ya está en uso." });
      }
      if (alias && clash.alias && clash.alias.toLowerCase() === alias.toLowerCase()) {
        return res.status(409).json({ error: "Ese alias ya está en uso." });
      }
      return res.status(409).json({ error: "Ese usuario o correo ya está registrado." });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const displayName = `${firstName} ${lastName}`.trim();

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        identifier: email, // kept for backward compatibility with existing login lookups
        email,
        username,
        alias: alias || null,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        password_hash: passwordHash,
        photo_url: photoUrl,
      })
      .select("id, email, username, alias, first_name, last_name, display_name, photo_url")
      .single();

    if (insertError) throw insertError;

    const token = signToken({ id: user.id, identifier: email });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        alias: user.alias,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        photoUrl: user.photo_url,
      },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(422).json({ error: "Ocurrió un error inesperado. Intenta de nuevo." });
  }
};
