import "server-only";
import type { Locale } from "./locales";
import zh from "@/dictionaries/zh.json";
import en from "@/dictionaries/en.json";

/**
 * Dictionary type 由 zh.json 推得；en.json 必須結構一致（以 zh 為 source of truth）。
 */
export type Dictionary = typeof zh;

const dictionaries: Record<Locale, Dictionary> = {
  zh: zh as Dictionary,
  en: en as unknown as Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
