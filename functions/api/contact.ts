/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * 流程：
 *  1. 驗證 payload（name / email / message 必填）
 *  2. Turnstile 驗證（若 secret 設定且 token 帶上）
 *  3. 寫入 Supabase contact_submissions（若 service_role 設定）
 *  4. Resend 通知信（若 RESEND_API_KEY 設定）
 *  5. 任何外部整合失敗都不阻斷流程 — 表單一律回 success；email_sent flag 在 DB 反映實際狀態
 *
 * Graceful degradation：所有外部整合都是 optional，env 未設時跳過該段。
 * 寫於 Cloudflare Pages Functions runtime（Workers）— 用 fetch + REST，不引 supabase-js / resend SDK
 * 以保持 bundle 小且避免 Node-only API 依賴。
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_NOTIFY_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface ContactBody {
  name?: string;
  email?: string;
  company?: string | null;
  product_interest?: string | null;
  message?: string;
  locale?: string;
  turnstileToken?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const onRequestOptions = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequest = async (): Promise<Response> =>
  json(405, { success: false, message: "Method not allowed. Use POST." });

export const onRequestPost = async (ctx: PagesContext): Promise<Response> => {
  const { request, env } = ctx;

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json(400, { success: false, message: "Invalid JSON body." });
  }

  // ---- 1. 基本驗證 ----
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  if (!name || !email || !message) {
    return json(400, {
      success: false,
      message: "Name, email, and message are required.",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { success: false, message: "Invalid email address." });
  }

  const company = (body.company ?? "").toString().trim() || null;
  const product_interest = (body.product_interest ?? "").toString().trim() || null;
  const locale = (body.locale ?? "zh").toString();

  // ---- 2. Turnstile 驗證（optional）----
  if (env.TURNSTILE_SECRET_KEY) {
    if (!body.turnstileToken) {
      return json(403, {
        success: false,
        message: "Anti-bot verification missing.",
      });
    }
    try {
      const tr = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: body.turnstileToken,
          }),
        },
      );
      const td = (await tr.json()) as { success?: boolean };
      if (!td.success) {
        return json(403, {
          success: false,
          message: "Anti-bot verification failed.",
        });
      }
    } catch (e) {
      console.error("[contact] turnstile error:", e);
      // 驗證 API 異常時不阻斷使用者（避免 CF 端瞬斷把所有 submit 擋掉）
    }
  }

  // ---- 3. Supabase 寫入（optional, service_role）----
  let insertedId: string | null = null;
  if (env.SUPABASE_SERVICE_ROLE_KEY && env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/contact_submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            name,
            email,
            company,
            product_interest,
            message,
            locale,
            status: "new",
          }),
        },
      );
      if (res.ok) {
        const rows = (await res.json()) as { id?: string }[];
        insertedId = rows?.[0]?.id ?? null;
      } else {
        console.error(
          "[contact] supabase insert failed:",
          res.status,
          await res.text(),
        );
      }
    } catch (e) {
      console.error("[contact] supabase insert error:", e);
    }
  }

  // ---- 4. Resend 通知信（optional）----
  let emailSent = false;
  if (env.RESEND_API_KEY && env.CONTACT_NOTIFY_EMAIL) {
    const from = env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to: env.CONTACT_NOTIFY_EMAIL,
          subject: `[Green Energy] New inquiry from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:system-ui,sans-serif;">
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;width:140px;">Name</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(email)}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Company</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(company ?? "N/A")}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Product Interest</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(product_interest ?? "N/A")}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Locale</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(locale)}</td></tr>
            </table>
            <h3 style="margin-top:24px;">Message</h3>
            <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:6px;">${escapeHtml(message)}</p>
          `,
        }),
      });
      emailSent = r.ok;
      if (!r.ok) {
        console.error("[contact] resend failed:", r.status, await r.text());
      }
    } catch (e) {
      console.error("[contact] resend error:", e);
    }
  }

  // ---- 5. 寄信成功後更新 email_sent flag ----
  if (
    emailSent &&
    insertedId &&
    env.SUPABASE_SERVICE_ROLE_KEY &&
    env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    try {
      await fetch(
        `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/contact_submissions?id=eq.${insertedId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
          }),
        },
      );
    } catch (e) {
      console.error("[contact] email_sent patch error:", e);
    }
  }

  return json(200, {
    success: true,
    message: "Thank you for your inquiry. We will get back to you within 24 hours.",
  });
};
