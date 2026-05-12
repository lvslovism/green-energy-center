"use client";
import { useState, useCallback, createContext, useContext } from "react";

export type ToastKind = "success" | "error" | "info";
export type ToastItem = {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
};

type ToastCtx = {
  push: (t: Omit<ToastItem, "id">) => void;
};

const Ctx = createContext<ToastCtx>({ push: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="adm-toast-stack" aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast-${t.kind}`} role="status">
            <div className="adm-toast-title">{t.title}</div>
            {t.body && <div className="adm-toast-body">{t.body}</div>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

/** Save 成功後固定附帶的 deploy 提示文字 */
export const DEPLOY_HINT = "內容已儲存，請執行 CLI deploy 以更新線上版本。";
