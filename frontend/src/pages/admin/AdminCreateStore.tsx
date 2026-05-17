import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { validateAddress, validateEmail, validateName } from "../../lib/validators";

export function AdminCreateStore() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const issues = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      ownerEmail ? validateEmail(ownerEmail) : null,
    ].filter(Boolean) as string[];
    if (issues.length > 0) {
      setErr(issues[0]);
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, string> = { name, email, address };
      if (ownerEmail) body.ownerEmail = ownerEmail;
      await api("/admin/stores", { method: "POST", body: JSON.stringify(body) });
      nav("/admin/stores");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Create store</h1>
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {err && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">
            {err}
          </div>
        )}
        <Field label="Store name (20–60 characters)" value={name} onChange={setName} hint={`${name.length} / 60`} />
        <Field label="Store email" type="email" value={email} onChange={setEmail} />
        <Field label="Address (max 400)" value={address} onChange={setAddress} textarea hint={`${address.length} / 400`} />
        <Field
          label="Owner email (optional — promotes existing user to OWNER)"
          type="email"
          value={ownerEmail}
          onChange={setOwnerEmail}
          optional
        />
        <button
          disabled={busy}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2 px-4 rounded-lg"
        >
          {busy ? "Creating…" : "Create store"}
        </button>
      </form>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; hint?: string; optional?: boolean }) {
  const common = "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="block text-sm font-medium text-slate-700">{props.label}</label>
        {props.hint && <span className="text-xs text-slate-400">{props.hint}</span>}
      </div>
      {props.textarea ? (
        <textarea rows={3} className={common} value={props.value} onChange={(e) => props.onChange(e.target.value)} required={!props.optional} />
      ) : (
        <input type={props.type ?? "text"} className={common} value={props.value} onChange={(e) => props.onChange(e.target.value)} required={!props.optional} />
      )}
    </div>
  );
}
