"use client";
import { useEffect } from "react";

type TrackingScriptsProps = {
  ga4Id: string;
  gtmId: string;
  metaPixelId: string;
  linkedinPartnerId: string;
  clarityProjectId: string;
};

/**
 * Tracking 程式碼動態注入。
 * 在 client mount 後依設定值將各家 SDK script 加入 <head>。
 * 所有欄位皆為 optional — 留空就不注入。
 *
 * 規則：
 *  - GA4 與 GTM 二擇一：若有 GTM 則由 GTM 管理 GA4，避免重複計數
 *  - 重新 mount（如語系切換）會嘗試重覆插入；script 內各家 SDK 自有 idempotency 保護
 */
export default function TrackingScripts({
  ga4Id,
  gtmId,
  metaPixelId,
  linkedinPartnerId,
  clarityProjectId,
}: TrackingScriptsProps) {
  useEffect(() => {
    const appended: HTMLScriptElement[] = [];

    const appendScript = (id: string, attrs: Partial<HTMLScriptElement>, inline?: string) => {
      if (document.getElementById(id)) return; // idempotent
      const s = document.createElement("script");
      s.id = id;
      Object.assign(s, attrs);
      if (inline) s.textContent = inline;
      document.head.appendChild(s);
      appended.push(s);
    };

    // GA4（GTM 未設時才獨立載入）
    if (ga4Id && !gtmId) {
      appendScript("trk-ga4-loader", {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`,
      });
      appendScript(
        "trk-ga4-init",
        {},
        `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${ga4Id}');`,
      );
    }

    // GTM
    if (gtmId) {
      appendScript(
        "trk-gtm",
        {},
        `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
      );
    }

    // Meta Pixel
    if (metaPixelId) {
      appendScript(
        "trk-meta-pixel",
        {},
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${metaPixelId}');fbq('track','PageView');`,
      );
    }

    // LinkedIn Insight
    if (linkedinPartnerId) {
      appendScript(
        "trk-linkedin",
        {},
        `_linkedin_partner_id="${linkedinPartnerId}";
window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];
var b=document.createElement("script");b.type="text/javascript";b.async=true;
b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b,s);})(window.lintrk);`,
      );
    }

    // Microsoft Clarity
    if (clarityProjectId) {
      appendScript(
        "trk-clarity",
        {},
        `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${clarityProjectId}");`,
      );
    }
    // 不 cleanup — 已注入的 third-party 全域 state 沒法精確回滾，
    // 而且 route change 不會卸載 layout，所以 mount 一次即可。
  }, [ga4Id, gtmId, metaPixelId, linkedinPartnerId, clarityProjectId]);

  return null;
}
