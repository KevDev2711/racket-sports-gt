const { getSupabase, verifyToken, setCors } = require("../_lib");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido." });

  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No autenticado." });

    const payload = verifyToken(token);
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, alias, first_name, last_name, display_name, photo_url")
      .eq("id", payload.sub)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    return res.status(200).json({
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
    return res.status(401).json({ error: "Sesión inválida o expirada." });
  }
};
