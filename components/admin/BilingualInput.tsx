"use client";

type Value = { zh: string; en: string };

type Props = {
  label: string;
  value: Value;
  onChange: (next: Value) => void;
  multiline?: boolean;
  rows?: number;
};

export default function BilingualInput({ label, value, onChange, multiline, rows = 3 }: Props) {
  const safe: Value = { zh: value?.zh ?? "", en: value?.en ?? "" };
  return (
    <div className="adm-field">
      <label className="adm-field-label">{label}</label>
      <div className="adm-bilingual">
        <div className="adm-bilingual-col">
          <span className="adm-lang-tag">ZH</span>
          {multiline ? (
            <textarea
              className="adm-textarea"
              rows={rows}
              value={safe.zh}
              onChange={(e) => onChange({ ...safe, zh: e.target.value })}
            />
          ) : (
            <input
              className="adm-input"
              type="text"
              value={safe.zh}
              onChange={(e) => onChange({ ...safe, zh: e.target.value })}
            />
          )}
        </div>
        <div className="adm-bilingual-col">
          <span className="adm-lang-tag">EN</span>
          {multiline ? (
            <textarea
              className="adm-textarea"
              rows={rows}
              value={safe.en}
              onChange={(e) => onChange({ ...safe, en: e.target.value })}
            />
          ) : (
            <input
              className="adm-input"
              type="text"
              value={safe.en}
              onChange={(e) => onChange({ ...safe, en: e.target.value })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
