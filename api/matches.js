const { getSupabase, verifyToken, setCors } = require("./_lib");

const MAX_GAMES_PER_MATCH = 15;

function isValidDateStr(raw) {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const d = new Date(raw + "T00:00:00Z");
  return !Number.isNaN(d.getTime());
}

/**
 * GET  /api/matches          — list match history (all, or ?playerId=<id> for one player), newest first.
 * POST /api/matches          — record a new match: { player1Id, player2Id, matchDate, games: [{player1Score, player2Score}, ...] }
 * Both require auth. Any logged-in user can record a match for any two players.
 */
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  let userId;
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No autenticado." });
    userId = verifyToken(token).sub;
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada." });
  }

  const supabase = getSupabase();

  if (req.method === "GET") {
    try {
      const { playerId } = req.query || {};
      let query = supabase
        .from("matches")
        .select(
          "id, match_date, player1_id, player2_id, player1_games_won, player2_games_won, winner_id, created_at, " +
            "player1:player1_id(id, username, alias, first_name, last_name, display_name, photo_url), " +
            "player2:player2_id(id, username, alias, first_name, last_name, display_name, photo_url), " +
            "games(id, game_number, player1_score, player2_score)"
        )
        .order("match_date", { ascending: false })
        .order("id", { ascending: false });

      if (playerId) {
        const pid = Number(playerId);
        if (!Number.isInteger(pid)) return res.status(400).json({ error: "playerId inválido." });
        query = query.or(`player1_id.eq.${pid},player2_id.eq.${pid}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const matches = (data || []).map((m) => ({
        id: m.id,
        matchDate: m.match_date,
        winnerId: m.winner_id,
        createdAt: m.created_at,
        player1: formatPlayer(m.player1, m.player1_games_won),
        player2: formatPlayer(m.player2, m.player2_games_won),
        games: (m.games || [])
          .sort((a, b) => a.game_number - b.game_number)
          .map((g) => ({ gameNumber: g.game_number, player1Score: g.player1_score, player2Score: g.player2_score })),
      }));

      return res.status(200).json({ matches });
    } catch (err) {
      return res.status(500).json({ error: "No se pudo cargar el historial de partidos." });
    }
  }

  if (req.method === "POST") {
    try {
      const { player1Id, player2Id, matchDate, games } = req.body || {};
      const p1 = Number(player1Id);
      const p2 = Number(player2Id);

      if (!Number.isInteger(p1) || !Number.isInteger(p2)) {
        return res.status(422).json({ error: "Debes seleccionar dos jugadores válidos." });
      }
      if (p1 === p2) {
        return res.status(422).json({ error: "Un jugador no puede jugar contra sí mismo." });
      }
      if (!isValidDateStr(matchDate)) {
        return res.status(422).json({ error: "Fecha inválida." });
      }
      if (!Array.isArray(games) || games.length === 0 || games.length > MAX_GAMES_PER_MATCH) {
        return res.status(422).json({ error: `Debes registrar entre 1 y ${MAX_GAMES_PER_MATCH} sets.` });
      }

      const cleanGames = [];
      for (const g of games) {
        const s1 = Number(g && g.player1Score);
        const s2 = Number(g && g.player2Score);
        if (!Number.isInteger(s1) || !Number.isInteger(s2) || s1 < 0 || s2 < 0 || s1 === s2) {
          return res.status(422).json({ error: "Cada set debe tener un marcador válido y sin empates." });
        }
        cleanGames.push({ s1, s2 });
      }

      // Confirm both players exist.
      const { data: players, error: playersErr } = await supabase
        .from("users")
        .select("id")
        .in("id", [p1, p2]);
      if (playersErr) throw playersErr;
      if (!players || players.length !== 2) {
        return res.status(404).json({ error: "Uno de los jugadores no existe." });
      }

      const player1GamesWon = cleanGames.filter((g) => g.s1 > g.s2).length;
      const player2GamesWon = cleanGames.filter((g) => g.s2 > g.s1).length;
      const winnerId = player1GamesWon === player2GamesWon ? null : player1GamesWon > player2GamesWon ? p1 : p2;

      const { data: match, error: matchErr } = await supabase
        .from("matches")
        .insert({
          player1_id: p1,
          player2_id: p2,
          match_date: matchDate,
          player1_games_won: player1GamesWon,
          player2_games_won: player2GamesWon,
          winner_id: winnerId,
          created_by: userId,
        })
        .select("id")
        .single();
      if (matchErr) throw matchErr;

      const gameRows = cleanGames.map((g, idx) => ({
        match_id: match.id,
        game_number: idx + 1,
        player1_score: g.s1,
        player2_score: g.s2,
      }));
      const { error: gamesErr } = await supabase.from("games").insert(gameRows);
      if (gamesErr) throw gamesErr;

      return res.status(201).json({ matchId: match.id });
    } catch (err) {
      return res.status(500).json({ error: "No se pudo registrar el partido." });
    }
  }

  return res.status(405).json({ error: "Método no permitido." });
};

function formatPlayer(u, gamesWon) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    alias: u.alias,
    firstName: u.first_name,
    lastName: u.last_name,
    displayName: u.display_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
    photoUrl: u.photo_url,
    gamesWon,
  };
}
