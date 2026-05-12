"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Client-side admin Supabase client。
 * - 使用 anon key（不是 service_role）；CRUD 權限由 RLS + auth session 控制
 * - persistSession: true 讓 admin 登入後保留在 localStorage
 * - 僅供 /admin 路由下的 client components 使用
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // 在 client side 不 throw（會炸整個 SPA），改 console.error
  console.error("[supabase-admin] Missing env vars");
}

export const supabaseAdmin = createClient<Database>(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "gec-admin-auth",
  },
});
