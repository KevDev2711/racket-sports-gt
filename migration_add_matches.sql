-- Match history and per-game scores between registered players, plus a
-- computed ranking (win/loss/win%) derived from matches.

CREATE TABLE IF NOT EXISTS matches (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player1_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player2_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_date date NOT NULL,
  player1_games_won int NOT NULL DEFAULT 0,
  player2_games_won int NOT NULL DEFAULT 0,
  winner_id bigint REFERENCES users(id) ON DELETE SET NULL,
  created_by bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_different_players CHECK (player1_id <> player2_id)
);

CREATE TABLE IF NOT EXISTS games (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id bigint NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  game_number int NOT NULL,
  player1_score int NOT NULL CHECK (player1_score >= 0),
  player2_score int NOT NULL CHECK (player2_score >= 0),
  CONSTRAINT games_unique_number_per_match UNIQUE (match_id, game_number)
);

CREATE INDEX IF NOT EXISTS matches_player1_idx ON matches (player1_id);
CREATE INDEX IF NOT EXISTS matches_player2_idx ON matches (player2_id);
CREATE INDEX IF NOT EXISTS matches_date_idx ON matches (match_date DESC);
CREATE INDEX IF NOT EXISTS games_match_idx ON games (match_id);
