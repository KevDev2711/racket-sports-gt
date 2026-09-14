const bcrypt = require("bcryptjs");
const { getSupabase, signToken, normalizeIdentifier, setCors } = require("../_lib");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  try {
    const { identifier, password } = req.body || {};
    const cleanId = normalizeIdentifier(identifier);
    const cleanPassword = String(password || "");

    if (!cleanId || !cleanPassword) {
      return res.status(422).json({ error: "Usuario y contraseña son requeridos." });
    }

    const supabase = getSupabase();

    // Accept a username, alias, or email as the login identifier. Strip
    // characters that have special meaning in a PostgREST `.or()` filter
    // string (`,` `(` `)`) so user input can never break out of the filter.
    const safeId = cleanId.replace(/[,()]/g, "");
    if (!safeId) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, alias, first_name, last_name, display_name, photo_url, password_hash")
      .or(`username.ilike.${safeId},alias.ilike.${safeId},email.ilike.${safeId}`)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const ok = bcrypt.compareSync(cleanPassword, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const token = signToken({ id: user.id, identifier: user.email });
    return res.status(200).json({
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
    console.error("login error:", err);
    return res.status(422).json({ error: "Ocurrió un error inesperado. Intenta de nuevo." });
  }
};
