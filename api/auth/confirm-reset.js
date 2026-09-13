const bcrypt = require("bcryptjs");
const { getSupabase, setCors } = require("../_lib");

/**
 * Step 2 of password reset: user submits the token (from the email link)
 * plus their new password. We validate the token hasn't expired, then
 * update the password hash and clear the token so it can't be reused.
 */
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  try {
    const { token, password } = req.body || {};
    const cleanToken = String(token || "").trim();
    const cleanPassword = String(password || "");

    if (!cleanToken) {
      return res.status(422).json({ error: "Enlace de restablecimiento inválido." });
    }
    if (cleanPassword.length < 6) {
      return res.status(422).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const supabase = getSupabase();

    const { data: user, error: lookupError } = await supabase
      .from("users")
      .select("id, reset_token, reset_token_expires")
      .eq("reset_token", cleanToken)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!user) {
      return res.status(400).json({ error: "El enlace es inválido o ya fue usado. Solicita uno nuevo." });
    }

    const expired = !user.reset_token_expires || new Date(user.reset_token_expires) < new Date();
    if (expired) {
      return res.status(400).json({ error: "El enlace ha expirado. Solicita uno nuevo." });
    }

    const passwordHash = bcrypt.hashSync(cleanPassword, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return res.status(200).json({ message: "Tu contraseña fue actualizada. Ya puedes iniciar sesión." });
  } catch (err) {
    console.error("confirm-reset error:", err);
    return res.status(500).json({ error: "Ocurrió un error inesperado. Intenta de nuevo." });
  }
};
