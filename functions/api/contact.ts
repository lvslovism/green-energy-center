/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Step 3 範圍：表單接收 stub，僅回傳 success。
 * Step 8 將整合 Resend 寄信 + 寫入 Supabase contact_submissions table。
 *
 * 不同於 Next.js app/api，這個檔位於 repo 根目錄的 functions/，
 * 由 Cloudflare Pages 在執行階段以 Workers Runtime 執行。
 * 不會被 next build 處理，靜態匯出時忽略。
 */

interface ContactBody {
  name?: string;
  email?: string;
  company?: string;
  product?: string;
  message?: string;
}

interface PagesContext {
  request: Request;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });

export const onRequestOptions = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  let body: ContactBody;
  try {
    body = (await context.request.json()) as ContactBody;
  } catch {
    return json(400, { success: false, message: "Invalid JSON body." });
  }

  // 基本驗證：name + email + message 為必填
  const required = ["name", "email", "message"] as const;
  for (const key of required) {
    const value = body[key];
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      return json(400, { success: false, message: `Missing required field: ${key}` });
    }
  }

  // 簡易 email 格式檢查
  const email = body.email!.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { success: false, message: "Invalid email format." });
  }

  // TODO Step 8:
  //   1. 用 RESEND_API_KEY 寄信通知 CONTACT_NOTIFY_EMAIL
  //   2. 寫入 Supabase greentech.contact_submissions
  //   3. Cloudflare Turnstile 驗證

  return json(200, {
    success: true,
    message: "Thank you for your inquiry. We will get back to you within 24 hours.",
  });
};

export const onRequest = async (): Promise<Response> =>
  json(405, { success: false, message: "Method not allowed. Use POST." });
