"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export default function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="adm-collapsible">
      <button
        type="button"
        className="adm-collapsible-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <ChevronRight
          size={16}
          className={`adm-collapsible-icon ${open ? "adm-collapsible-icon--open" : ""}`}
        />
        <span>{title}</span>
      </button>
      {open && <div className="adm-collapsible-body">{children}</div>}
    </div>
  );
}
