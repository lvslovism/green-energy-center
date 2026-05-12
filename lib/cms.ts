import { supabase } from "./supabase";
import type { Tables } from "./database.types";

/**
 * Build-time CMS fetch layer.
 * 所有 Supabase query 集中於此；page.tsx 只透過這支匯出。
 * Runtime 不會走這支（static export 後 HTML 已嵌好內容）。
 *
 * 任一 fetch fail 都不拋例外，回 null / [] 讓上層 fallback 到 dictionaries/。
 */

export type SiteSettingsRow = Tables<"site_settings">;
export type ProductRow = Tables<"products">;
export type PillarRow = Tables<"technology_pillars">;
export type RdStatRow = Tables<"rd_stats">;
export type CertificationRow = Tables<"certifications">;
export type MilestoneRow = Tables<"milestones">;
export type TeamMemberRow = Tables<"team_members">;

export async function fetchSiteSettings(): Promise<SiteSettingsRow | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[CMS] fetchSiteSettings error:", error.message);
    return null;
  }
  return data;
}

export async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[CMS] fetchProducts error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error(`[CMS] fetchProductBySlug(${slug}) error:`, error.message);
    return null;
  }
  return data;
}

export async function fetchTechnologyPillars(): Promise<PillarRow[]> {
  const { data, error } = await supabase
    .from("technology_pillars")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[CMS] fetchTechnologyPillars error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchRdStats(): Promise<RdStatRow[]> {
  const { data, error } = await supabase
    .from("rd_stats")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[CMS] fetchRdStats error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchCertifications(): Promise<CertificationRow[]> {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[CMS] fetchCertifications error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchMilestones(page: "technology" | "about"): Promise<MilestoneRow[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("page", page)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error(`[CMS] fetchMilestones(${page}) error:`, error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchTeamMembers(): Promise<TeamMemberRow[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[CMS] fetchTeamMembers error:", error.message);
    return [];
  }
  return data ?? [];
}
