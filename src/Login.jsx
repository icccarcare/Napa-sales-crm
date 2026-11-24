import { useState } from "react";
import { supabase } from "./supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    setBusy(false);
  };

  const input = { width: "100%", padding: "10px 12px", marginBottom: 12, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 15, boxSizing: "border-box" };
  return (
    <div style={{ minHeight: "100vh", background: "#081d63", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Trebuchet MS','Segoe UI',sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 28, borderRadius: 10, width: 320, borderTop: "5px solid #ffc928" }}>
        <h2 style={{ margin: "0 0 4px", color: "#081d63" }}>NAPA Sales CRM</h2>
        <p style={{ margin: "0 0 18px", color: "#2a3550", fontSize: 13 }}>Pilot Point — sign in</p>
        <input style={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        {err && <div style={{ color: "#cc0000", fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button disabled={busy} style={{ width: "100%", padding: 11, background: "#cc0000", color: "#fff", border: 0, borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
