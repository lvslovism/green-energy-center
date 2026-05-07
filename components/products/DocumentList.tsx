import { FileText, Shield, FileSpreadsheet, Box, Download, type LucideIcon } from "lucide-react";
import type { ProductDocument } from "@/lib/products";

function pickIcon(name: string, type: string): LucideIcon {
  const lower = name.toLowerCase();
  if (type.toUpperCase() === "STEP" || lower.includes("cad")) return Box;
  if (lower.includes("test report") || lower.includes("certif")) return Shield;
  if (lower.includes("msds") || lower.includes("sds")) return FileSpreadsheet;
  return FileText;
}

export default function DocumentList({
  documents,
  downloadLabel,
}: {
  documents: ProductDocument[];
  downloadLabel: string;
}) {
  return (
    <ul className="doc-list" role="list">
      {documents.map((d) => {
        const Icon = pickIcon(d.name, d.type);
        return (
          <li key={d.name} className="doc-item">
            <div className="doc-icon" aria-hidden>
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <div className="doc-info">
              <div className="doc-name">{d.name}</div>
              <div className="doc-meta">
                {d.type}
                <span className="doc-meta-sep">·</span>
                {d.size}
                {d.version && (
                  <>
                    <span className="doc-meta-sep">·</span>
                    {d.version}
                  </>
                )}
              </div>
            </div>
            <a
              href="#"
              className="doc-download"
              data-cursor-hover
              aria-label={`${downloadLabel} ${d.name}`}
            >
              <Download size={14} strokeWidth={1.6} />
              <span>{downloadLabel}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
