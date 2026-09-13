/**
 * Shared helpers for the Racket Sports GT — Table Tennis serverless API.
 * Uses the Supabase service role key (server-side only, never exposed to the browser)
 * to talk directly to Postgres, bypassing Row Level Security by design (RLS blocks the
 * public anon key; the service role key is meant to access data from trusted server code).
 */
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET env var.");
  return jwt.sign({ sub: user.id, identifier: user.identifier }, secret, {
    expiresIn: "7d",
  });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET env var.");
  return jwt.verify(token, secret);
}

function normalizeIdentifier(raw) {
  return String(raw || "").trim().toLowerCase();
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = { getSupabase, signToken, verifyToken, normalizeIdentifier, setCors };
