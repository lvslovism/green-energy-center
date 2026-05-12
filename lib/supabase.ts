import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Build-time / Server-side Supabase client（anon key, RLS read-only）。
 *
 * - 用於：app/[locale] 下的 page.tsx 在 SSG 時讀取內容（Step 6 才會接）
 * - 受 RLS 限制：可 SELECT 所有 public 表格，無法 INSERT/UPDATE/DELETE
 * - Service role 另用於 CF Pages Function（contact submit）— 不放在這支 client
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.local",
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
