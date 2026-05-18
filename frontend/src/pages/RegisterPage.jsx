import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateAddress, validateEmail, validateName, validatePassword } from "../lib/validators";

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    const issues = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);
    if (issues.length > 0) {
      setErr(issues[0]);
      return;
    }
    setBusy(true);
    try {
      await register({ name, email, address, password });
      nav("/stores");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500 mt-1">Sign up as a normal user</p>
        </div>
        {err && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">
            {err}
          </div>
        )}
        <Field label="Name (20–60 characters)" value={name} onChange={setName} hint={`${name.length} / 60`} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Address (max 400)" value={address} onChange={setAddress} textarea hint={`${address.length} / 400`} />
        <Field label="Password (8–16, 1 uppercase, 1 special)" type="password" value={password} onChange={setPassword} />
        <button
          disabled={busy}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-slate-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type, textarea, hint, optional }) {
  const common = "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {textarea ? (
        <textarea rows={3} className={common} value={value} onChange={(e) => onChange(e.target.value)} required={!optional} />
      ) : (
        <input type={type ?? "text"} className={common} value={value} onChange={(e) => onChange(e.target.value)} required={!optional} />
      )}
    </div>
  );
}
