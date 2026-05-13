"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * Runtime tracking — 在瀏覽器端即時從 Supabase 讀取 site_settings.tracking，
 * 動態注入 GA4 / GTM / Meta Pixel / LinkedIn / Clarity script + 渲染 LINE 浮動按鈕。
 *
 * 設計重點：
 *  - Module-level cache：同一個 session 只 fetch 一次（SPA 導航不重複）
 *  - 注入後設 scriptsInjected 旗標，避免 React strict-mode / re-render 重覆插入
 *  - 各 script 用固定 id；DOM 層級再加保險（document.getElementById 檢查）
 *  - GA4 與 GTM 互斥：有 GTM 時不獨立載入 GA4（避免雙重計數）
 *  - Anon key 即可讀取（RLS public_read）；service role 不放這裡
 *  - CMS 改 tracking ID 後不需 rebuild，使用者下次 page load 就生效
 */

type TrackingData = {
  ga4_id: string;
  gtm_id: string;
  line_oa_url: string;
  meta_pixel_id: string;
  linkedin_partner_id: string;
  clarity_project_id: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let cachedTracking: TrackingData | null = null;
let inflight: Promise<TrackingData | null> | null = null;

function readTracking(): Promise<TrackingData | null> {
  if (cachedTracking) return Promise.resolve(cachedTracking);
  if (inflight) return inflight;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return Promise.resolve(null);

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  inflight = (async () => {
    const { data, error } = await client
      .from("site_settings")
      .select("tracking")
      .limit(1)
      .maybeSingle();
    inflight = null;
    if (error) {
      console.error("[RuntimeTracking] fetch error:", error.message);
      return null;
    }
    const row = data as { tracking?: Record<string, unknown> } | null;
    const raw = row?.tracking ?? {};
    const str = (k: string) =>
      typeof raw[k] === "string" ? (raw[k] as string) : "";
    const result: TrackingData = {
      ga4_id: str("ga4_id"),
      gtm_id: str("gtm_id"),
      line_oa_url: str("line_oa_url"),
      meta_pixel_id: str("meta_pixel_id"),
      linkedin_partner_id: str("linkedin_partner_id"),
      clarity_project_id: str("clarity_project_id"),
    };
    cachedTracking = result;
    return result;
  })();
  return inflight;
}

function injectScript(id: string, src?: string, inline?: string) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  if (src) {
    s.async = true;
    s.src = src;
  }
  if (inline) s.textContent = inline;
  document.head.appendChild(s);
}

export default function RuntimeTracking() {
  const [tracking, setTracking] = useState<TrackingData | null>(cachedTracking);
  const [scriptsInjected, setScriptsInjected] = useState(false);

  // 1. Fetch tracking config
  useEffect(() => {
    let mounted = true;
    if (cachedTracking) {
      setTracking(cachedTracking);
      return;
    }
    readTracking().then((data) => {
      if (mounted && data) setTracking(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Inject scripts (once)
  useEffect(() => {
    if (!tracking || scriptsInjected) return;
    const { ga4_id, gtm_id, meta_pixel_id, linkedin_partner_id, clarity_project_id } = tracking;

    if (ga4_id && !gtm_id) {
      injectScript("trk-ga4-loader", `https://www.googletagmanager.com/gtag/js?id=${ga4_id}`);
      injectScript(
        "trk-ga4-init",
        undefined,
        `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${ga4_id}');`,
      );
    }

    if (gtm_id) {
      injectScript(
        "trk-gtm",
        undefined,
        `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm_id}');`,
      );
    }

    if (meta_pixel_id) {
      injectScript(
        "trk-meta-pixel",
        undefined,
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${meta_pixel_id}');fbq('track','PageView');`,
      );
    }

    if (linkedin_partner_id) {
      injectScript(
        "trk-linkedin",
        undefined,
        `_linkedin_partner_id="${linkedin_partner_id}";
window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];
var b=document.createElement("script");b.type="text/javascript";b.async=true;
b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b,s);})(window.lintrk);`,
      );
    }

    if (clarity_project_id) {
      injectScript(
        "trk-clarity",
        undefined,
        `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${clarity_project_id}");`,
      );
    }

    setScriptsInjected(true);
  }, [tracking, scriptsInjected]);

  // 3. LINE 浮動按鈕
  if (!tracking?.line_oa_url) return null;

  return (
    <a
      href={tracking.line_oa_url}
      target="_blank"
      rel="noopener noreferrer"
      className="line-float-btn"
      aria-label="LINE official account"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
      </svg>
    </a>
  );
}
