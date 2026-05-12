"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

type AuthState =
  | { status: "loading" }
  | { status: "unauth" }
  | { status: "auth"; session: Session };

type Ctx = {
  email: string;
  signOut: () => Promise<void>;
};

import { createContext, useContext } from "react";

const AuthCtx = createContext<Ctx | null>(null);

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth outside AuthGuard");
  return c;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    supabaseAdmin.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState(data.session ? { status: "auth", session: data.session } : { status: "unauth" });
    });
    const { data: sub } = supabaseAdmin.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setState(session ? { status: "auth", session } : { status: "unauth" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state.status === "loading") {
    return <div className="adm-loading">Loading…</div>;
  }
  if (state.status === "unauth") {
    return <LoginForm />;
  }

  const email = state.session.user.email ?? "";
  const signOut = async () => {
    await supabaseAdmin.auth.signOut();
  };

  return <AuthCtx.Provider value={{ email, signOut }}>{children}</AuthCtx.Provider>;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
    }
    // 成功時 onAuthStateChange 會自動更新 state
  };

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <div className="adm-login-brand-name">綠能科技 Admin</div>
          <div className="adm-login-brand-sub">Content Management</div>
        </div>
        <form onSubmit={onSubmit}>
          <div className="adm-field">
            <label className="adm-field-label">Email</label>
            <input
              className="adm-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@greentech.tw"
              autoComplete="email"
            />
          </div>
          <div className="adm-field">
            <label className="adm-field-label">Password</label>
            <input
              className="adm-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {err && (
            <div
              role="alert"
              style={{
                color: "var(--admin-error)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {err}
            </div>
          )}
          <button
            type="submit"
            className="adm-btn adm-btn-primary"
            disabled={busy}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
