const bcrypt = require("bcryptjs");
const { getSupabase, signToken, normalizeIdentifier, setCors } = require("../_lib");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  try {
    const { identifier, displayName, password } = req.body || {};
    const cleanId = normalizeIdentifier(identifier);
    const cleanName = String(displayName || "").trim();
    const cleanPassword = String(password || "");

    if (!cleanId || !cleanPassword) {
      return res.status(422).json({ error: "Usuario y contraseña son requeridos." });
    }
    if (cleanPassword.length < 6) {
      return res.status(422).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const supabase = getSupabase();

    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("identifier", cleanId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) {
      return res.status(409).json({ error: "Ese usuario o correo ya está registrado." });
    }

    const passwordHash = bcrypt.hashSync(cleanPassword, 10);

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        identifier: cleanId,
        display_name: cleanName || cleanId,
        password_hash: passwordHash,
      })
      .select("id, identifier, display_name")
      .single();

    if (insertError) throw insertError;

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, identifier: user.identifier, displayName: user.display_name },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(422).json({ error: "Ocurrió un error inesperado. Intenta de nuevo." });
  }
};
