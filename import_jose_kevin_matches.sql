
WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-01-24', 0, 2, 2, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 7, 10),(2, 7, 10)) AS g(n, p1, p2);


WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-02-24', 0, 3, 2, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 5, 10),(2, 4, 10),(3, 4, 5)) AS g(n, p1, p2);


WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-03-07', 2, 0, 3, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 10, 9),(2, 10, 7)) AS g(n, p1, p2);


WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-05-04', 1, 0, 3, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 6, 4)) AS g(n, p1, p2);


WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-05-07', 0, 1, 2, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 0, 1)) AS g(n, p1, p2);


WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-08-30', 0, 1, 2, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 7, 10)) AS g(n, p1, p2);


WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-09-04', 0, 1, 2, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 8, 10)) AS g(n, p1, p2);


WITH new_match AS (
  INSERT INTO matches (player1_id, player2_id, match_date, player1_games_won, player2_games_won, winner_id, created_by)
  VALUES (3, 2, '2026-09-05', 1, 0, 3, 2)
  RETURNING id
)
INSERT INTO games (match_id, game_number, player1_score, player2_score)
SELECT id, g.n, g.p1, g.p2 FROM new_match, (VALUES (1, 10, 8)) AS g(n, p1, p2);
