"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const PRODUCT_OPTIONS = [
  { value: "", label: "請選擇產品線", disabled: true },
  { value: "sodium-ion", label: "鈉離子電池" },
  { value: "lithium-ion", label: "高能量密度鋰電池" },
  { value: "supercapacitor", label: "全超電容" },
  { value: "hybrid", label: "混合儲能系統" },
  { value: "other", label: "其他" },
];

type FormState = {
  name: string;
  email: string;
  company: string;
  product: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  company: "",
  product: "",
  message: "",
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [data, setData] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setData((d) => ({ ...d, [key]: e.target.value }));
    };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { success?: boolean; message?: string };
      if (!json.success) throw new Error(json.message || "提交失敗");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (status === "success") {
    return (
      <div className="cf-success" role="status">
        <div className="cf-success-icon">
          <CheckCircle2 size={44} strokeWidth={1.4} />
        </div>
        <h3 className="cf-success-title">感謝您的詢問</h3>
        <p className="cf-success-text">我們將在 24 小時內回覆。</p>
        <button
          type="button"
          className="cf-success-reset"
          data-cursor-hover
          onClick={() => {
            setData(INITIAL);
            setStatus("idle");
          }}
        >
          再送一筆
        </button>
      </div>
    );
  }

  return (
    <form className="cf-form" onSubmit={onSubmit} noValidate>
      <div className="cf-row">
        <label className="cf-field">
          <span className="cf-label">
            姓名<span className="cf-req">*</span>
          </span>
          <input
            className="cf-input"
            name="name"
            type="text"
            placeholder="Your name"
            value={data.name}
            onChange={update("name")}
            required
            data-cursor-hover
          />
        </label>
        <label className="cf-field">
          <span className="cf-label">
            Email<span className="cf-req">*</span>
          </span>
          <input
            className="cf-input"
            name="email"
            type="email"
            placeholder="email@company.com"
            value={data.email}
            onChange={update("email")}
            required
            data-cursor-hover
          />
        </label>
      </div>

      <label className="cf-field">
        <span className="cf-label">公司名稱</span>
        <input
          className="cf-input"
          name="company"
          type="text"
          placeholder="Company name"
          value={data.company}
          onChange={update("company")}
          data-cursor-hover
        />
      </label>

      <label className="cf-field">
        <span className="cf-label">感興趣的產品</span>
        <select
          className="cf-input cf-select"
          name="product"
          value={data.product}
          onChange={update("product")}
          data-cursor-hover
        >
          {PRODUCT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="cf-field">
        <span className="cf-label">
          訊息<span className="cf-req">*</span>
        </span>
        <textarea
          className="cf-input cf-textarea"
          name="message"
          placeholder="Tell us about your project or requirements..."
          value={data.message}
          onChange={update("message")}
          required
          rows={6}
          data-cursor-hover
        />
      </label>

      {status === "error" && (
        <div className="cf-error" role="alert">
          送出失敗：{errorMsg || "請稍後再試。"}
        </div>
      )}

      <button
        type="submit"
        className="cf-submit"
        data-cursor-hover
        disabled={status === "submitting"}
      >
        <span>{status === "submitting" ? "送出中…" : "送出詢問"}</span>
        <ArrowRight size={16} strokeWidth={1.6} />
      </button>
    </form>
  );
}
