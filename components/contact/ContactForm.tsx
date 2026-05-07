"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export type ContactFormStrings = {
  name_label: string;
  name_placeholder: string;
  email_label: string;
  email_placeholder: string;
  company_label: string;
  company_placeholder: string;
  product_label: string;
  product_default: string;
  product_options: { value: string; label: string }[];
  message_label: string;
  message_placeholder: string;
  submit: string;
  submitting: string;
  error: string;
  success_title: string;
  success_text: string;
  success_reset: string;
};

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

export default function ContactForm({ strings }: { strings: ContactFormStrings }) {
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
      if (!json.success) throw new Error(json.message || "Submission failed");
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
        <h3 className="cf-success-title">{strings.success_title}</h3>
        <p className="cf-success-text">{strings.success_text}</p>
        <button
          type="button"
          className="cf-success-reset"
          data-cursor-hover
          onClick={() => {
            setData(INITIAL);
            setStatus("idle");
          }}
        >
          {strings.success_reset}
        </button>
      </div>
    );
  }

  return (
    <form className="cf-form" onSubmit={onSubmit} noValidate>
      <div className="cf-row">
        <label className="cf-field">
          <span className="cf-label">
            {strings.name_label}
            <span className="cf-req">*</span>
          </span>
          <input
            className="cf-input"
            name="name"
            type="text"
            placeholder={strings.name_placeholder}
            value={data.name}
            onChange={update("name")}
            required
            data-cursor-hover
          />
        </label>
        <label className="cf-field">
          <span className="cf-label">
            {strings.email_label}
            <span className="cf-req">*</span>
          </span>
          <input
            className="cf-input"
            name="email"
            type="email"
            placeholder={strings.email_placeholder}
            value={data.email}
            onChange={update("email")}
            required
            data-cursor-hover
          />
        </label>
      </div>

      <label className="cf-field">
        <span className="cf-label">{strings.company_label}</span>
        <input
          className="cf-input"
          name="company"
          type="text"
          placeholder={strings.company_placeholder}
          value={data.company}
          onChange={update("company")}
          data-cursor-hover
        />
      </label>

      <label className="cf-field">
        <span className="cf-label">{strings.product_label}</span>
        <select
          className="cf-input cf-select"
          name="product"
          value={data.product}
          onChange={update("product")}
          data-cursor-hover
        >
          <option value="" disabled>
            {strings.product_default}
          </option>
          {strings.product_options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="cf-field">
        <span className="cf-label">
          {strings.message_label}
          <span className="cf-req">*</span>
        </span>
        <textarea
          className="cf-input cf-textarea"
          name="message"
          placeholder={strings.message_placeholder}
          value={data.message}
          onChange={update("message")}
          required
          rows={6}
          data-cursor-hover
        />
      </label>

      {status === "error" && (
        <div className="cf-error" role="alert">
          {strings.error}
          {errorMsg && `：${errorMsg}`}
        </div>
      )}

      <button
        type="submit"
        className="cf-submit"
        data-cursor-hover
        disabled={status === "submitting"}
      >
        <span>{status === "submitting" ? strings.submitting : strings.submit}</span>
        <ArrowRight size={16} strokeWidth={1.6} />
      </button>
    </form>
  );
}
