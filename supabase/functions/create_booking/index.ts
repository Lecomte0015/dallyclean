// Supabase Edge Function: create_booking
// Deno runtime
// Env required:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY (server-side only)
// - RECAPTCHA_SECRET (optional in dev)
// - SENDGRID_API_KEY (optional)
// - ADMIN_EMAIL (optional)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RECAPTCHA_SECRET = Deno.env.get("RECAPTCHA_SECRET") ?? "";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") ?? "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";
const ALLOW_NO_RECAPTCHA = Deno.env.get("ALLOW_NO_RECAPTCHA") === "true";

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false }
});

async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  if (!token) return ALLOW_NO_RECAPTCHA; // allow in dev if env permits
  if (!RECAPTCHA_SECRET) return ALLOW_NO_RECAPTCHA;
  try {
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: token })
    });
    const json = await resp.json();
    return !!json.success;
  } catch {
    return false;
  }
}

async function sendEmail(to: string, subject: string, text: string) {
  if (!SENDGRID_API_KEY || !to) return;
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: ADMIN_EMAIL || "no-reply@example.com" },
      subject,
      content: [{ type: "text/plain", value: text }]
    })
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" }});
  }

  try {
    const body = await req.json();
    const { name, email, phone, service_id, city, date, time, notes, recaptchaToken } = body || {};

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const ok = await verifyRecaptcha(recaptchaToken);
    if (!ok) {
      return new Response(JSON.stringify({ error: "reCAPTCHA failed" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const { error: insertError } = await supabaseAdmin.from("bookings").insert([{
      name,
      email,
      phone: phone || null,
      service_id: service_id ?? null,
      city: city || null,
      date: date || null,
      time: time || null,
      notes: notes || null
    }]);
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const adminMsg = `Nouvelle demande:\nNom: ${name}\nEmail: ${email}\nTéléphone: ${phone || ""}\nService ID: ${service_id ?? ""}\nVille: ${city || ""}\nDate: ${date || ""} ${time || ""}\nNotes: ${notes || ""}`;
    if (ADMIN_EMAIL) await sendEmail(ADMIN_EMAIL, "Nouvelle réservation", adminMsg);
    if (email) await sendEmail(email, "Votre demande a bien été reçue", "Merci, nous vous contacterons pour confirmer votre rendez-vous.");

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
});
