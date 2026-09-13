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

    const { data: user, error } = await supabase
      .from("users")
      .select("id, identifier, display_name, password_hash")
      .eq("identifier", cleanId)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const ok = bcrypt.compareSync(cleanPassword, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const token = signToken(user);
    return res.status(200).json({
      token,
      user: { id: user.id, identifier: user.identifier, displayName: user.display_name },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(422).json({ error: "Ocurrió un error inesperado. Intenta de nuevo." });
  }
};
