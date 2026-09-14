const { getSupabase, verifyToken, setCors } = require("./_lib");

/** GET /api/rankings — win/loss/win% leaderboard computed from match history. Requires auth. */
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

    const { data: players, error: playersErr } = await supabase
      .from("users")
      .select("id, username, alias, first_name, last_name, display_name, photo_url");
    if (playersErr) throw playersErr;

    const { data: matches, error: matchesErr } = await supabase
      .from("matches")
      .select("player1_id, player2_id, winner_id");
    if (matchesErr) throw matchesErr;

    const stats = new Map();
    for (const p of players || []) {
      stats.set(p.id, { player: p, wins: 0, losses: 0, ties: 0, played: 0 });
    }

    for (const m of matches || []) {
      const s1 = stats.get(m.player1_id);
      const s2 = stats.get(m.player2_id);
      if (s1) s1.played += 1;
      if (s2) s2.played += 1;
      if (m.winner_id == null) {
        if (s1) s1.ties += 1;
        if (s2) s2.ties += 1;
      } else if (m.winner_id === m.player1_id) {
        if (s1) s1.wins += 1;
        if (s2) s2.losses += 1;
      } else if (m.winner_id === m.player2_id) {
        if (s2) s2.wins += 1;
        if (s1) s1.losses += 1;
      }
    }

    const rankings = Array.from(stats.values())
      .map(({ player: u, wins, losses, ties, played }) => ({
        id: u.id,
        username: u.username,
        alias: u.alias,
        firstName: u.first_name,
        lastName: u.last_name,
        displayName: u.display_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
        photoUrl: u.photo_url,
        matchesPlayed: played,
        wins,
        losses,
        ties,
        winPct: played > 0 ? Math.round((wins / played) * 1000) / 10 : null,
      }))
      .sort((a, b) => {
        if (b.winPct !== a.winPct) {
          if (a.winPct === null) return 1;
          if (b.winPct === null) return -1;
          return b.winPct - a.winPct;
        }
        if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
        return a.displayName.localeCompare(b.displayName);
      });

    return res.status(200).json({ rankings });
  } catch (err) {
    return res.status(500).json({ error: "No se pudo calcular la clasificación." });
  }
};
