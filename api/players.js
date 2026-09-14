const { getSupabase, verifyToken, setCors } = require("./_lib");

/** GET /api/players — list registered players (for opponent pickers). Requires auth. */
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido." });

  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No autenticado." });
    verifyToken(token);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, alias, first_name, last_name, display_name, photo_url")
      .order("first_name", { ascending: true });

    if (error) throw error;

    const players = (data || []).map((u) => ({
      id: u.id,
      username: u.username,
      alias: u.alias,
      firstName: u.first_name,
      lastName: u.last_name,
      displayName: u.display_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      photoUrl: u.photo_url,
    }));

    return res.status(200).json({ players });
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada." });
  }
};
