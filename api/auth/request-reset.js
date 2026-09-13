const crypto = require("crypto");
const { getSupabase, normalizeIdentifier, setCors } = require("../_lib");

/**
 * Step 1 of password reset: user submits their email/username.
 * We always respond with the same generic success message whether or not
 * the account exists — this avoids leaking which emails are registered.
 */
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  const GENERIC_MESSAGE =
    "Si existe una cuenta con ese usuario o correo, enviamos un enlace para restablecer la contraseña.";

  try {
    const { identifier } = req.body || {};
    const cleanId = normalizeIdentifier(identifier);

    if (!cleanId) {
      return res.status(422).json({ error: "Ingresa tu usuario o correo." });
    }

    const supabase = getSupabase();

    const { data: user, error: lookupError } = await supabase
      .from("users")
      .select("id, identifier, display_name")
      .eq("identifier", cleanId)
      .maybeSingle();

    if (lookupError) throw lookupError;

    // Account doesn't exist — still return success (no email enumeration).
    if (!user) {
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    // Only actually send an email if the identifier looks like one.
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.identifier);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const { error: updateError } = await supabase
      .from("users")
      .update({ reset_token: token, reset_token_expires: expires.toISOString() })
      .eq("id", user.id);

    if (updateError) throw updateError;

    if (looksLikeEmail) {
      const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
      const resetLink = `${siteUrl}/?reset_token=${token}`;

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "Racket Sports GT <onboarding@resend.dev>",
            to: [user.identifier],
            subject: "Restablece tu contraseña — Racket Sports GT",
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
                <h2 style="color:#16a34a">Racket Sports GT</h2>
                <p>Hola ${user.display_name || ""},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace (válido por 30 minutos):</p>
                <p style="margin:24px 0">
                  <a href="${resetLink}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Restablecer contraseña</a>
                </p>
                <p style="color:#666;font-size:13px">Si no solicitaste esto, puedes ignorar este correo — tu contraseña no cambiará.</p>
                <p style="color:#999;font-size:12px">${resetLink}</p>
              </div>
            `,
          }),
        });

        if (!emailRes.ok) {
          const errBody = await emailRes.text().catch(() => "");
          console.error("Resend error:", emailRes.status, errBody);
        }
      } else {
        console.error("RESEND_API_KEY no configurada — no se pudo enviar el correo de reseteo.");
      }
    }

    return res.status(200).json({ message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("request-reset error:", err);
    return res.status(500).json({ error: "Ocurrió un error inesperado. Intenta de nuevo." });
  }
};
