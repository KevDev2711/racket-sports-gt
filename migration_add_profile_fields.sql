-- Add richer profile fields to support the new registration form:
-- first_name, last_name, username (unique), alias (unique, optional),
-- email (unique, separated from the old combined "identifier"), photo_url.
-- Existing rows are backfilled from `identifier` (which was always an email
-- for the 2 current users) and `display_name`.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS alias text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Backfill email from the old identifier column (all existing identifiers are emails).
UPDATE users SET email = identifier WHERE email IS NULL;

-- Backfill first_name/last_name by splitting display_name on the first space.
UPDATE users
SET
  first_name = COALESCE(first_name, split_part(display_name, ' ', 1)),
  last_name = COALESCE(last_name, NULLIF(substring(display_name FROM position(' ' IN display_name) + 1), display_name))
WHERE first_name IS NULL;

-- Backfill a username slug from email's local part, de-duplicated with the id
-- so existing accounts have something usable until they set a real one.
UPDATE users
SET username = COALESCE(username, lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g')) || '_' || id)
WHERE username IS NULL;

-- Enforce uniqueness going forward (email and username are both required at signup).
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_alias_unique ON users (lower(alias)) WHERE alias IS NOT NULL;
